import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { createChart, CrosshairMode } from "lightweight-charts";
import { data } from "./consts.js";
import "./styles.css";

function App() {
  useEffect(() => {
    init();
  }, []);
  const init = useCallback(() => {
    var chart = createChart(document.getElementById("chart1"), {
      width:  1400,
      height: 800,
      crosshair: {
        mode: CrosshairMode.Normal
      },
      priceScale: {
        scaleMargins: {
          top: 0.3,
          bottom: 0.25
        },
        borderVisible: false
      },
      layout: {
        backgroundColor: "#131722",
        textColor: "#d1d4dc"
      },
      grid: {
        vertLines: {
          color: "rgba(42, 46, 57, 0)"
        },
        horzLines: {
          color: "rgba(42, 46, 57, 0.6)"
        }
      }
    });
    // var areaSeries = chart.addAreaSeries({
    //   topColor: "rgba(38,198,218, 0.56)",
    //   bottomColor: "rgba(38,198,218, 0.04)",
    //   lineColor: "rgba(38,198,218, 1)",
    //   lineWidth: 2
    // });

    var volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      lineWidth: 2,
      priceFormat: {
        type: "volume"
      },
      overlay: true,
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });
    var candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(data);
    volumeSeries.setData([
      { time: "2018-10-19", value: 19103293.0, color: "rgba(0, 150, 136, 0.8)" }
    ]);
    var lastClose = data[data.length - 1].close;
    var lastIndex = data.length - 1;

    var targetIndex = lastIndex + 105 + Math.round(Math.random() + 30);
    var targetPrice = getRandomPrice();

    var currentIndex = lastIndex + 1;
    var currentBusinessDay = { day: 29, month: 5, year: 2019 };
    var ticksInCurrentBar = 0;
    var currentBar = {
      open: null,
      high: null,
      low: null,
      close: null,
      time: currentBusinessDay
    };
    var currentVolume = {
      value: null,
      time: currentBusinessDay
    };

    function mergeTickToBar(price, volumn) {
      let color = "rgba(0, 150, 136, 0.8)";
      if (currentBar.open === null) {
        currentBar.open = price;
        currentBar.high = price;
        currentBar.low = price;
        currentBar.close = price;
      } else {
        currentBar.close = price;
        currentBar.high = Math.max(currentBar.high, price);
        currentBar.low = Math.min(currentBar.low, price);
      }
      if (currentBar.open > price) {
        color = "rgba(255,82,82, 0.8)";
      }
      if (currentVolume.value === null) {
        currentVolume.value = volumn;
      } else {
        currentVolume.value = currentVolume.value;
      }
      currentVolume.color = color;
      candleSeries.update(currentBar);
      volumeSeries.update(currentVolume);
    }

    function reset() {
      candleSeries.setData(data);
      lastClose = data[data.length - 1].close;
      lastIndex = data.length - 1;

      targetIndex = lastIndex + 5 + Math.round(Math.random() + 30);
      targetPrice = getRandomPrice();

      currentIndex = lastIndex + 1;
      currentBusinessDay = { day: 29, month: 5, year: 2019 };
      ticksInCurrentBar = 0;
    }

    function getRandomPrice() {
      return 10 + Math.round(Math.random() * 10000) / 100;
    }

    function nextBusinessDay(time) {
      var d = new Date();
      d.setUTCFullYear(time.year);
      d.setUTCMonth(time.month - 1);
      d.setUTCDate(time.day + 1);
      d.setUTCHours(0, 0, 0, 0);
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate()
      };
    }

    setInterval(function() {
      var deltaY = targetPrice - lastClose;
      var deltaX = targetIndex - lastIndex;
      var angle = deltaY / deltaX;
      var basePrice = lastClose + (currentIndex - lastIndex) * angle;
      var noise = 0.1 - Math.random() * 0.2 + 1.0;
      var noisedPrice = basePrice * noise;
      var volumn = Math.round(Math.random() * 100000000);
      mergeTickToBar(noisedPrice, volumn);
      if (++ticksInCurrentBar === 5) {
        // move to next bar
        currentIndex++;
        currentBusinessDay = nextBusinessDay(currentBusinessDay);
        currentBar = {
          open: null,
          high: null,
          low: null,
          close: null,
          time: currentBusinessDay
        };
        currentVolume = {
          value: null,
          time: currentBusinessDay,
          color: "rgba(0, 150, 136, 0.8)"
        };
        ticksInCurrentBar = 0;
        if (currentIndex === 5000) {
          reset();
          return;
        }
        if (currentIndex === targetIndex) {
          // change trend
          lastClose = noisedPrice;
          lastIndex = currentIndex;
          targetIndex = lastIndex + 5 + Math.round(Math.random() + 30);
          targetPrice = getRandomPrice();
        }
      }
    }, 2000);
  }, []);
  return (
    <div className="App">
      <h1>For CB trading chart dev</h1>
      <div id="chart1" />
      <div id="chart2" />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
