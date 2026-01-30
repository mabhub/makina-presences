/**
 * Custom hook for managing spot interactions
 * Handles drag & drop, clicks, and UI state
 */

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { snap } from '../helpers';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const qs = [
  '?',
  'user_field_names=true',
  'size=200',
].join('&');

/**
 * Spot interactions hook
 * @param {Object} spot - Spot data
 * @param {boolean} edit - Edit mode flag
 * @returns {Object} Interaction handlers and state
 */
const useSpotInteractions = (spot, edit) => {
  const queryClient = useQueryClient();
  const queryKey = ['table', Number(spotsTableId), qs];

  // Drag & drop state
  const [movingSpot, setMovingSpot] = useState();

  // UI state
  const [contextualMenu, setContextualMenu] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [isHover, setIsHover] = useState(false);

  // Drag & drop handlers
  const handleMouseDown = useCallback(s => ({ screenX, screenY }) => {
    if (!edit) { return null; }
    return setMovingSpot({ spot: s, from: [screenX, screenY] });
  }, [edit]);

  const handleDragEnd = useCallback(async ({ screenX: x2, screenY: y2 }) => {
    if (!movingSpot || !edit) { return; }

    const { spot: s, from: [x1, y1] = [] } = movingSpot;
    const deltas = { x: x2 - x1, y: y2 - y1 };

    setMovingSpot();

    // Calcul des nouvelles coordonnées
    const newX = snap(deltas.x + Number(s.x));
    const newY = snap(deltas.y + Number(s.y));

    // Optimistic update - utilise la même clé que useTable
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, old => {
      if (!old?.results) return old;
      return {
        ...old,
        results: old.results.map(item =>
          item.id === spot.id
            ? { ...item, x: newX, y: newY }
            : item,
        ),
      };
    });

    const { VITE_BASEROW_TOKEN: token } = import.meta.env;

    try {
      await fetch(
        `https://api.baserow.io/api/database/rows/table/${spotsTableId}/${spot.id}/?user_field_names=true`,
        {
          method: 'PATCH',
          headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            x: newX,
            y: newY,
          }),
        },
      );

      queryClient.invalidateQueries({ queryKey: ['table', Number(spotsTableId)] });
    } catch (error) {
      // Rollback en cas d'erreur
      queryClient.setQueryData(queryKey, previousData);
      // eslint-disable-next-line no-console
      console.error('Failed to update spot position:', error);
    }
  }, [movingSpot, edit, spot.id, queryClient, queryKey]);

  // Mouse interaction handlers
  const handleMouseEnter = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => setIsHover(false), []);

  // Context menu handlers
  const openContextualMenu = useCallback(event => {
    setContextualMenu(true);
    setAnchor(event.target);
  }, []);

  const closeContextualMenu = useCallback(() => {
    setContextualMenu(false);
  }, []);

  return {
    // Drag & drop
    handleMouseDown,
    handleDragEnd,
    movingSpot,

    // Mouse interactions
    handleMouseEnter,
    handleMouseLeave,
    isHover,

    // Context menu
    contextualMenu,
    anchor,
    openContextualMenu,
    closeContextualMenu,
  };
};

export default useSpotInteractions;
