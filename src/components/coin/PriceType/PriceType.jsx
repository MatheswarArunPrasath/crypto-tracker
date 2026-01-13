import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import './styles.css'

export default function PriceType({ priceType, handlePriceTypeChange }){
  return (
    <div className='toggle-prices'>
        <ToggleButtonGroup
        value={priceType}
        exclusive
        onChange={handlePriceTypeChange}
        sx={{
            border: "1px solid var(--white)",
            borderRadius: "0.5rem",
        }}
        >
            <ToggleButton
                value="prices"
                sx={{
                    color: "var(--white)",
                    borderColor: "var(--white)",
                    "&.Mui-selected": {
                        backgroundColor: "#3a80e9",
                        color: "#fff",
                        borderColor: "#3a80e9",
                    },
                    "&:hover": {
                        backgroundColor: "rgba(58, 128, 233, 0.1)",
                    },
                }}
            >
                Price
            </ToggleButton>
            <ToggleButton
                value="market_caps"
                sx={{
                    color: "var(--white)",
                    borderColor: "var(--white)",
                    "&.Mui-selected": {
                        backgroundColor: "#3a80e9",
                        color: "#fff",
                        borderColor: "#3a80e9",
                    },
                    "&:hover": {
                        backgroundColor: "rgba(58, 128, 233, 0.1)",
                    },
                }}
            >
                Market Cap
            </ToggleButton>
            <ToggleButton
                value="total_volumes"
                sx={{
                    color: "var(--white)",
                    borderColor: "var(--white)",
                    "&.Mui-selected": {
                        backgroundColor: "#3a80e9",
                        color: "#fff",
                        borderColor: "#3a80e9",
                    },
                    "&:hover": {
                        backgroundColor: "rgba(58, 128, 233, 0.1)",
                    },
                }}
            >
                Total Volume
            </ToggleButton>
        </ToggleButtonGroup>
    </div>

  );
}
