import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header/header';
import Loader from '../components/common/loader/Loader';
import { coinObject } from '../functions/convertObject';
import List from '../components/dashboard/list/List';
import CoinInfo from '../components/coin/CoinInfo/CoinInfo';
import { getCoinData } from '../functions/getCoinData';
import { getCoinPrices } from '../functions/getCoinPrices';
import LineChart from '../components/coin/LineChart/LineChart';
import SelectDays from '../components/coin/SelectDays/SelectDays';
import { settingChartData } from '../functions/settingChartData';
import PriceType from '../components/coin/PriceType/PriceType';

const CoinPage = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [coinData, setCoinData] = useState();
  const [days, setDays] = useState(30);
  const [chartData, setChartData] = useState({});
  const [priceType, setPriceType] = useState('prices');

  useEffect(() => {
    if (id) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, days, priceType]);

  async function getData() {
    try {
      setIsLoading(true);
      const data = await getCoinData(id);
      if (data) {
        coinObject(setCoinData, data);

        const prices = await getCoinPrices(id, days, priceType);
        console.log("Price Data:", prices);

        if (prices && prices.length > 0) {
          settingChartData(setChartData, prices);
        }
      }
    } catch (error) {
      console.error("Error in getData:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDaysChange = (event) => {
    const newDays = event.target.value;
    setDays(newDays);
  };

  const handlePriceTypeChange = (event, newType) => {
    if (newType !== null) {
      setPriceType(newType);
    }
  };

  return (
    <div>
      <Header />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className='grey-wrapper' style={{ padding: '0rem 1rem' }}>
            <List coin={coinData} />
          </div>

          <div className="grey-wrapper">
            <SelectDays days={days} handleDaysChange={handleDaysChange} />
            <PriceType priceType={priceType} handlePriceTypeChange={handlePriceTypeChange} />
            <LineChart chartData={chartData} />
          </div>

          <CoinInfo heading={coinData?.name} desc={coinData?.desc} />
        </>
      )}
    </div>
  );
};

export default CoinPage;
