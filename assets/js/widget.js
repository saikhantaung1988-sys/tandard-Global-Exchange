const container = document.getElementById('tradingview-widget');

const script = document.createElement('script');
script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
script.async = true;
script.type = 'text/javascript';

script.innerHTML = JSON.stringify({
  "lineWidth": 2,
  "lineType": 0,
  "chartType": "area",
  "showVolume": true,
  "fontColor": "rgb(106, 109, 120)",
  "gridLineColor": "rgba(242, 242, 242, 0.06)",
  "volumeUpColor": "rgba(34, 171, 148, 0.5)",
  "volumeDownColor": "rgba(247, 82, 95, 0.5)",
  "backgroundColor": "rgba(25, 26, 31, 1)",
  "widgetFontColor": "rgba(255, 255, 255, 1)",
  "upColor": "#22ab94",
  "downColor": "#f7525f",
  "borderUpColor": "#22ab94",
  "borderDownColor": "#f7525f",
  "wickUpColor": "#22ab94",
  "wickDownColor": "#f7525f",
  "colorTheme": "dark",
  "isTransparent": false,
  "locale": "en",
  "chartOnly": false,
  "scalePosition": "right",
  "scaleMode": "Normal",
  "fontFamily": "Arial, sans-serif",
  "valuesTracking": "1",
  "changeMode": "price-and-percent",
  "symbols": [
    [
      "TVC:USOIL|1M|USD"
    ],
    [
      "CRYPTO:BTCUSD|1M|USD"
    ],
    [
      "TVC:GOLD|1M|USD"
    ],
    [
      "NASDAQ:CME|1M|USD"
    ],
    [
      "CRYPTOCAP:USDT|1M|USD"
    ]
  ],
  "dateRanges": [
    "1m|30",
    "3m|60",
    "12m|1D",
    "60m|1W",
    "120m|1M"
  ],
  "fontSize": "10",
  "headerFontSize": "small",
  "autosize": true,
  "width": "100%",
  "height": "100%",
  "noTimeScale": false,
  "hideDateRanges": false,
  "showMA": true,
  "maLength": "150",
  "maLineColor": "rgba(66, 189, 168, 0.51)",
  "maLineWidth": 1,
  "hideMarketStatus": false,
  "hideSymbolLogo": false
});

container.appendChild(script);
