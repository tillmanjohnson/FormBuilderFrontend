import React from 'react';
import { Typography, Box } from '@mui/material';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';

export default function BrandLogo({ onClick, sx = {} }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        cursor: onClick ? 'pointer' : 'default',
        ...sx
      }}
    >
      <DynamicFormIcon color="primary" sx={{ fontSize: '1.8rem' }} />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'text.primary',
          lineHeight: 1,
        }}
      >
        Uni<Box component="span" sx={{ color: 'primary.main' }}>Form</Box>
      </Typography>
    </Box>
  );
}