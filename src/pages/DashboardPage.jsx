import React, { useState, useEffect } from 'react'
import Header from '../components/common/Header/header'
import TabsComponent from '../components/dashboard/Tabs/TabsComponent'
import axios from 'axios'
import Search from '../components/dashboard/search/Search';
import PaginationControlled from '../components/dashboard/pagination/PaginationControlled';
import Loader from '../components/common/loader/Loader';

const DashboardPage = () => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [paginatedcoins, setPaginatedCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const onSearchChange=(e)=>{
    setSearch(e.target.value);
  }

  const [page, setPage] = React.useState(1);

    const handlePageChange = (event, value) => {
      setPage(value);
      var previousIndex=(value-1)*12;
      setPaginatedCoins(coins.slice(previousIndex, previousIndex+10));
    };

  var filteredCoins = coins.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.symbol.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'inr',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: false,
            },
            headers: {
              'x-cg-demo-api-key': 'CG-xVZVvq7DcjHSUygfQ7DAqqHJ',
            },
          }
        );
        console.log("Fetched coins:", response.data);
        setCoins(response.data);
        setPaginatedCoins(response.data.slice(0, 12));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching coins:', error);
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, []);

  return (
  <>
    <Header/>
    {isLoading ? (
      <Loader/>
    ) : (
      <div>
        <Search search={search} onSearchChange={onSearchChange} />
        <TabsComponent coins={search ? filteredCoins : paginatedcoins} />
        {!search && (
          <PaginationControlled page={page} handlePageChange={handlePageChange} />
        )}
      </div>
    )}
  </>
);

};

export default DashboardPage;
