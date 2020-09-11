const readline = require('readline');
const fs = require('fs');
const brain = require('brain.js');
const readInterface = readline.createInterface({
  input: fs.createReadStream('./WasLetztePreis_training.csv'),
  // output: process.stdout,
  console: false
});
const writeStream = fs.createWriteStream('./WasLetztePreis_output.txt', {
  // flags: 'a' // 'a' means appending (old data will be preserved)
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
console.log('Starting');
readInterface.on('line', (line) => {
  lineCount++;
  if (lineCount === 1) {
    console.log('SKIP');
    return;
  }
  const split = line.split(',');
  const entry = {};
  let preis;
  if (split[1] !== '') {
    preis = parseInt(split[1], 10);
    prices.push(preis);
    if (min['preis'] == null || preis < min['preis']) {
      min['preis'] = preis;
    }
    if (max['preis'] == null || preis > max['preis']) {
      max['preis'] = preis;
    }
  }

  columns.slice(2).forEach((c, index) => {
    data[c].push({input: split[index + 2], output: split[1]});
    if (c === 'ps' || c === 'kilometerstand') {
      entry[c] = parseInt(split[index + 2], 10);
    } else if (c === 'erstzulassung' || c === 'verkaufsdatum') {
      entry[c] = new Date(split[index + 2]).getTime();
    } else {
      entry[c] = split[index + 2];
    }
    if (min[c] == null || entry[c] < min[c]) {
      min[c] = entry[c];
    }
  });

  if (preis == null) {
    missingData.push({id: split[0], entry});
  } else {
    rawData.push({id: split[0], preis: preis, entry});
  }

});

readInterface.on('close', (line) => {
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
  const psData = data['ps'].map((e) => parseInt(e.input, 10));
  const psOffset = min['ps'];
  const psFactor = max['ps'] - min['ps'];
  // console.log('ps', map['ps']);
  console.timeEnd('Mapped PS');

  console.log('Mapping Kilometerstand...');
  console.time('Mapped Kilometerstand');
  const kmData = data['kilometerstand'].map((e) => parseInt(e.input, 10));
  const kmOffset = min['kilometerstand'];
  const kmFactor = max['kilometerstand'] - min['kilometerstand'];
  // console.log('kilometerstand', map['kilometerstand']);
  console.timeEnd('Mapped Kilometerstand');

  console.log('Mapping Erstzulassung...');
  console.time('Mapped Erstzulassung');
  const ezData = data['erstzulassung'].map((e) => new Date(e.input).getTime());
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
  const vdData = data['verkaufsdatum'].map((e) => new Date(e.input).getTime());
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

  const mappedData = rawData.map((e) => mapEntry(e));
  // console.log('mappedData', mappedData);
  const trainingData = mappedData.map((e) => ({
    input: Object.values(e.entry),
    output: [(e.preis - priceOffset) / priceFactor]
  }));
  // console.log('trainingData', trainingData);
  console.timeEnd('Finished Mapping');

  var net = new brain.NeuralNetwork();
  console.log('Starting Training (' + trainingData.length + ' elements)...');
  console.time('Finished training');
  net.train(trainingData, {
    // Defaults values --> expected validation
    iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
    log: false, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 10, // iterations between logging out --> number greater than 0
    learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
    momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
    callback: null, // a periodic call back that can be triggered while training --> null or function
    callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
    timeout: 10 * 60 * 1000 // the max number of milliseconds to train for --> number greater than 0
  });
  console.timeEnd('Finished training');

  missingData.forEach((e) => {
    const id = e.id;
    const input = Object.values(mapEntry(e).entry);
    const result = net.run(input);
    // console.log(id, result);
    const preis = result[0] * priceFactor + priceOffset;
    // const preis = 3000;
    // console.log(id, preis);
    writeStream.write(id + ' ' + preis + '\n');
  });
});

//
writeStream.write('df5139dd7f9cc68f544c58782c8b8f037afb5fb0f9ffc2c23110846e1ed1ece5' + '\n');
// // writeStream.write('4b9c472869462dd1f155a002860b963f689699f8a1afe965131ea2392441c60d' + '\n');
// // writeStream.write('016dc8cd9f1092dfc9d7081c6bcc06d2aa89e7a380b8531130d6a79b990c8645' + '\n');
writeStream.write('Ingolais krasse Abgabe' + '\n');
//
// readInterface.on('line', (line) => {
//   const split = line.split(',');
//   if (split[1] === '') {
//     const entry = {id: split[0], input: split.slice(2)};
//     missing.push(entry);
//     // console.log('Reading', split[0]);
//   } else {
//     const price = parseInt(split[1], 10);
//     const entry = {input: split.slice(2).join(','), output: [price]};
//     data.push(entry);
//     // console.log('Reading', split[0], price);
//   }
// });
//
// readInterface.on('close', (line) => {
//   console.log('Data', data.length);
//   console.log('Missing', missing.length);
//   var net = new brain.NeuralNetwork();
//   console.log('Training...');
//   net.train(data, {
//     // Defaults values --> expected validation
//     iterations: 200, // the maximum times to iterate the training data --> number greater than 0
//     errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
//     log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
//     logPeriod: 10, // iterations between logging out --> number greater than 0
//     learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
//     momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
//     callback: null, // a periodic call back that can be triggered while training --> null or function
//     callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
//     timeout: 30 * 1000, // the max number of milliseconds to train for --> number greater than 0
//   });
//   console.log('Finished training!');
//   missing.forEach((e) => {
//     console.log('Calculating', e.id);
//     const output = net.run(e.input);
//     console.log(e.input, output);
//     writeStream.write(e.id + ' ' + output + '\n');
//   });
// });




