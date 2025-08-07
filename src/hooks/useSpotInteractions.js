/**
 * Custom hook for managing spot interactions
 * Handles drag & drop, clicks, and UI state
 */

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { snap } from '../helpers';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

/**
 * Spot interactions hook
 * @param {Object} spot - Spot data
 * @param {boolean} edit - Edit mode flag
 * @returns {Object} Interaction handlers and state
 */
const useSpotInteractions = (spot, edit) => {
  const queryClient = useQueryClient();

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

    const { s, from: [x1, y1] = [] } = movingSpot;
    const deltas = { x: x2 - x1, y: y2 - y1 };

    setMovingSpot();

    const { VITE_BASEROW_TOKEN: token } = import.meta.env;

    await fetch(
      `https://api.baserow.io/api/database/rows/table/${spotsTableId}/${spot.id}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: snap(deltas.x + Number(s.x)),
          y: snap(deltas.y + Number(s.y)),
        }),
      },
    );

    queryClient.invalidateQueries([spotsTableId]);
  }, [movingSpot, edit, spot.id, queryClient]);

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
