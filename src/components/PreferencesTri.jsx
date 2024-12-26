import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Done, Edit } from '@mui/icons-material';
import { Box, Divider, IconButton, TextField } from '@mui/material';
import { cleanTri } from '../helpers';

const useTriState = createPersistedState('tri');

const PreferencesTri = () => {
  const [tri, setTri] = useTriState();
  const [disableInput, setDisableInput] = React.useState(true);
  const [textValue, setTextValue] = React.useState(tri);

  const isTriValid = textValue?.length >= 3;

  const handleSubmit = () => {
    if (!disableInput && isTriValid) setTri(cleanTri(textValue));
    setDisableInput(!disableInput);
  };

  const handleKeyPress = event => {
    if (event.charCode === 13 && isTriValid) {
      handleSubmit();
    }
  };

  return (
    <>
      <Divider textAlign="left">Trigramme</Divider>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', mx: '16px', my: '10px' }}>
        <TextField
          fullWidth
          size="small"
          defaultValue={textValue}
          inputProps={{
            maxLength: 10,
            autoCapitalize: 'off',
            autoCorrect: 'off',
          }}
          inputRef={input => input && input.focus()}
          disabled={disableInput}
          onKeyPress={handleKeyPress}
          onChange={event => (setTextValue(event.target.value))}
        />
        <IconButton
          sx={{ ml: 1 }}
          onClick={handleSubmit}
          disabled={!isTriValid}
        >
          {disableInput
            ? <Edit color="primary" />
            : (
              <Done
                color={isTriValid ? 'primary' : ''}
              />
            )}
        </IconButton>
      </Box>
    </>
  );
};

export default React.memo(PreferencesTri);
