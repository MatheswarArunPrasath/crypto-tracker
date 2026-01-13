import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Grid from '../grid/Grid';
import "./styles.css";
import List from '../list/List';

export default function TabsComponent({coins, setSearch}) {
  const [value, setValue] = React.useState('grid');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const theme=createTheme({
    palette: {
        primary: {
            main: "#3a80e9",
        },
    },
  });

  const style={
    color: "var(--white)",
    "& .Mui-selected":{
        color: "var(--blue) !important",
    },
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    textTransform: "capitalize",
  };

  return (
    <ThemeProvider theme={theme}>
      <TabContext value={value}>
        <div style={{borderBottom: 1, borderColor: "divider"}}>
          <TabList onChange={handleChange} variant='fullWidth'>
            <Tab label="Grid" value="grid" sx={style}/>
            <Tab label="List" value="list" sx={style}/>
          </TabList>
        </div>
        <TabPanel value="grid">
            <div className='grid-flex'>
              {coins.map((coin, i)=>{
                return <Grid coin={coin} key={i}/>
              })}
            </div>
        </TabPanel>
        <TabPanel value="list">
            <table className='list-table'>
                {coins.map((item, i)=>{
                  return (
                    <List coin={ item } key={ i }/>
                  )
                })}
            </table>
        </TabPanel>
      </TabContext>
    </ThemeProvider>
  );
}


