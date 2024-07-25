import React from 'react';
import createPersistedState from 'use-persisted-state';

import { Done, Edit } from '@mui/icons-material';
import { Box, Divider, IconButton, TextField } from '@mui/material';

const useTriState = createPersistedState('tri');

const PreferencesTri = () => {
  const [tri, setTri] = useTriState();
  const [disableInput, setDisableInput] = React.useState(true);
  const [textValue, setTextValue] = React.useState(tri);

  const handleSubmit = () => {
    if (!disableInput) setTri(textValue);
    setDisableInput(!disableInput);
  };

  const handleKeyPress = event => {
    if (event.charCode === 13) {
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
          }}
          inputRef={input => input && input.focus()}
          disabled={disableInput}
          onKeyPress={handleKeyPress}
          onChange={event => (setTextValue(event.target.value))}
        />
        <IconButton
          sx={{ ml: 1 }}
          onClick={handleSubmit}
        >
          {disableInput
            ? <Edit color="primary" />
            : (
              <Done
                color="primary"
              />
            )}
        </IconButton>
      </Box>
    </>
  );
};

export default React.memo(PreferencesTri);
