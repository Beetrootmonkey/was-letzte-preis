const readline = require('readline');
const fs = require('fs');
const {LocalStorage} = require('node-localstorage');
const localStorage = new LocalStorage('./scratch', Number.MAX_VALUE);

const readInterface = readline.createInterface({
  input: fs.createReadStream('./WasLetztePreis_training.csv'),
  // output: process.stdout,
  console: false
});

const columns = 'id,preis,marke,model,bauform,kraftstoff,getriebe,ps,kilometerstand,erstzulassung,gebiet,verkaufsdatum'.split(',');
// const columns = 'id,preis,endreinigung,typ,stadt,stadtteil,lat,lon,bewertungen,bewertung,gaeste,baeder,schlafzimmer,betten,internet,wlan,kueche,heizung,klimaanlage,haartrockner,familienfreundlich,buegeleisen,waschmaschine,trockner,rauchmelder,kohlenmonoxidmelder,feuerloescher,erstehilfekoffer,fernsehen,kabelfernsehen,fruehstueck,kamin,fahrstuhl,pool,fitnessstudio,whirlpool,rollstuhlgeeignet,bettwaesche,mikrowelle,geschirr,ofen,herd,badewanne,kaffeemaschine,geschirrspueler,ebenerdig,kuehlschrank,rauchen,haustiere,hochstuhl,kinderkrippe,spielekonsole'.split(',');

const prices = [];
const data = {};
const missingData = [];
const rawData = [];
const min = {};
const max = {};
columns.slice(2).forEach((c) => {
  data[c] = [];
});
let lineCount = 0;
console.log('Starting...');
console.time('Finished!');
readInterface.on('line', (line) => {
  lineCount++;
  if (lineCount === 1) {
    // console.log('SKIP');
    return;
  }
  const split = line.split(',');
  const entry = {};
  let preis;
  if (split[1] !== '') {
    preis = parseInt(split[1], 10);
    if (preis < 500 || preis > 40000) return;
    prices.push(preis);
    if (min['preis'] == null || preis < min['preis']) {
      min['preis'] = preis;
    }
    if (max['preis'] == null || preis > max['preis']) {
      max['preis'] = preis;
    }
  }

  columns.slice(2).forEach((c, index) => {
    // if (entry[c] === '') return;
    if (c === 'ps' || c === 'kilometerstand' || c === 'erstzulassung') {
      entry[c] = parseInt(split[index + 2], 10);
      if (c === 'ps' && (entry[c] < 30 || entry[c] > 300) && preis != null) return;
      if (c === 'erstzulassung' && (entry[c] < 1970 || entry[c] > 2018) && preis != null) return;
    } else if (c === 'verkaufsdatum') {
      entry[c] = new Date(split[index + 2]).getTime();
      if (new Date(entry[c]) < new Date('1980-01-01') && preis != null) return;
      if (new Date(entry[c]) > new Date('2020-01-01') && preis != null) return;
    } else {
      entry[c] = split[index + 2];
    }
    if (preis != null) {
      if (min[c] == null || entry[c] < min[c]) {
        min[c] = entry[c];
      }
      if (max[c] == null || entry[c] > max[c]) {
        max[c] = entry[c];
      }
    }
    data[c].push({input: split[index + 2], output: split[1]});
  });

  if (preis == null) {
    missingData.push({id: split[0], entry});
  } else {
    rawData.push({id: split[0], preis: preis, entry});
  }

});

readInterface.on('close', (line) => {

  // console.log('min', min);
  // console.log('max', max);
  // return;

  // console.log('data', data);
  console.log('Starting Mapping...');
  console.time('Finished Mapping');

  console.log('Mapping Preise...');
  console.time('Mapped Preise');
  const priceOffset = min['preis'];
  const priceFactor = max['preis'] - min['preis'];
  // const mappedPrices = prices.reduce((acc, e, index) => ({...acc, [e]: (e - priceOffset) / priceFactor}), {});
  // console.log('mappedPrices', mappedPrices);
  console.timeEnd('Mapped Preise');

  let set;
  const map = {};

  console.log('Mapping Marken...');
  console.time('Mapped Marken');
  set = data['marke'].reduce((acc, e) => acc.add(e.input), new Set());
  map['marke'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('marke]', map['marke']);
  console.timeEnd('Mapped Marken');

  console.log('Mapping Modelle...');
  console.time('Mapped Modelle');
  set = data['model'].reduce((acc, e) => acc.add(e.input), new Set());
  map['model'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('model', map['model']);
  console.timeEnd('Mapped Modelle');

  console.log('Mapping Bauformen...');
  console.time('Mapped Bauformen');
  set = data['bauform'].reduce((acc, e) => acc.add(e.input), new Set());
  map['bauform'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('bauform', map['bauform']);
  console.timeEnd('Mapped Bauformen');

  console.log('Mapping Kraftstoff...');
  console.time('Mapped Kraftstoff');
  set = data['kraftstoff'].reduce((acc, e) => acc.add(e.input), new Set());
  map['kraftstoff'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('kraftstoff', map['kraftstoff']);
  console.timeEnd('Mapped Kraftstoff');

  console.log('Mapping Getriebe...');
  console.time('Mapped Getriebe');
  set = data['getriebe'].reduce((acc, e) => acc.add(e.input), new Set());
  map['getriebe'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('getriebe', map['getriebe']);
  console.timeEnd('Mapped Getriebe');

  console.log('Mapping PS...');
  console.time('Mapped PS');
  const psOffset = min['ps'];
  const psFactor = max['ps'] - min['ps'];
  // console.log('ps', map['ps']);
  console.timeEnd('Mapped PS');

  console.log('Mapping Kilometerstand...');
  console.time('Mapped Kilometerstand');
  const kmOffset = min['kilometerstand'];
  const kmFactor = max['kilometerstand'] - min['kilometerstand'];
  // console.log('kilometerstand', map['kilometerstand']);
  console.timeEnd('Mapped Kilometerstand');

  console.log('Mapping Erstzulassung...');
  console.time('Mapped Erstzulassung');
  const ezOffset = min['erstzulassung'];
  const ezFactor = max['erstzulassung'] - min['erstzulassung'];
  // console.log('erstzulassung', map['erstzulassung']);
  console.timeEnd('Mapped Erstzulassung');

  console.log('Mapping Gebiet...');
  console.time('Mapped Gebiet');
  set = data['gebiet'].reduce((acc, e) => acc.add(e.input), new Set());
  map['gebiet'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('gebiet', map['gebiet']);
  console.timeEnd('Mapped Gebiet');

  console.log('Mapping Verkaufsdatum...');
  console.time('Mapped Verkaufsdatum');
  const vdOffset = min['verkaufsdatum'];
  const vdFactor = max['verkaufsdatum'] - min['verkaufsdatum'];
  // console.log('verkaufsdatum', map['verkaufsdatum']);
  console.timeEnd('Mapped Verkaufsdatum');

  // console.log('rawData', rawData);
  // console.log('marke', map['marke']);
  // console.log('marke', map['marke']['audi']);
  const mapEntry = (e) => {
    const entry = {};
    Object.keys(map).forEach((key) => {
      if (key === 'ps') {
        entry[key] = (e.entry[key] - psOffset) / psFactor;
      } else if (key === 'kilometerstand') {
        entry[key] = (e.entry[key] - kmOffset) / kmFactor;
      } else if (key === 'verkaufsdatum') {
        entry[key] = (e.entry[key] - vdOffset) / vdFactor;
      } else if (key === 'erstzulassung') {
        entry[key] = (e.entry[key] - ezOffset) / ezFactor;
      } else {
        entry[key] = map[key][e.entry[key]];
      }
    });
    return {id: e.id, preis: e.preis, entry};
  };

  const mappedMissingData = missingData.map((e) => ({id: e.id, input: Object.values(mapEntry(e).entry)}));
  const mappedData = rawData.map((e) => mapEntry(e));
  // console.log('mappedData', mappedData);
  const trainingData = mappedData.map((e) => ({
    input: Object.values(e.entry),
    output: [(e.preis - priceOffset) / priceFactor]
  }));
  // console.log('trainingData', trainingData);
  console.timeEnd('Finished Mapping');

  console.log('Saving data...');
  console.time('Saved data');
  localStorage.setItem('missingData', JSON.stringify(mappedMissingData));
  localStorage.setItem('trainingData', JSON.stringify(trainingData));
  localStorage.setItem('priceOffset', JSON.stringify(priceOffset));
  localStorage.setItem('priceFactor', JSON.stringify(priceFactor));
  console.timeEnd('Saved data');
  console.timeEnd('Finished!');
});
