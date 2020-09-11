const readline = require('readline');
const fs = require('fs');
const brain = require('brain.js');
const readInterface = readline.createInterface({
  input: fs.createReadStream('./WasLetztePreis_training_light.csv'),
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
const rawData = [];
columns.slice(2).forEach((c) => {
  data[c] = [];
});
let lineCount = 0;
readInterface.on('line', (line) => {
  lineCount++;
  if (lineCount === 1) {
    return;
  }
  const split = line.split(',');
  if (split[1] === '') {
    // Skip
  } else {
    const entry = {};
    prices.push(parseInt(split[1], 10));
    columns.slice(2).forEach((c, index) => {
      data[c].push({input: split[index + 2], output: split[1]});
      if (c === 'ps' || c === 'kilometerstand') {
        entry[c] = parseInt(split[index + 2], 10);
      } else if (c === 'erstzulassung' || c === 'verkaufsdatum') {
        entry[c] = new Date(split[index + 2]).getTime();
      } else {
        entry[c] = split[index + 2];
      }
    });

    rawData.push(entry);
  }
});

readInterface.on('close', (line) => {
  // console.log('data', data);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceOffset = minPrice;
  const priceFactor = maxPrice - minPrice;
  const mappedPreis = prices.map((e) => ({input: e, output: (e - priceOffset) / priceFactor}));
  // console.log('mappedPreis', mappedPreis);

  let set;
  const map = {};

  set = data['marke'].reduce((acc, e) => acc.add(e.input), new Set());
  map['marke'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('marke]', map['marke']);

  set = data['model'].reduce((acc, e) => acc.add(e.input), new Set());
  map['model'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('model', map['model']);

  set = data['bauform'].reduce((acc, e) => acc.add(e.input), new Set());
  map['bauform'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('bauform', map['bauform']);

  set = data['kraftstoff'].reduce((acc, e) => acc.add(e.input), new Set());
  map['kraftstoff'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('kraftstoff', map['kraftstoff']);

  set = data['getriebe'].reduce((acc, e) => acc.add(e.input), new Set());
  map['getriebe'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('getriebe', map['getriebe']);

  const psData = data['ps'].map((e) => parseInt(e.input, 10));
  const minPs = Math.min(...psData);
  const maxPs = Math.max(...psData);
  const psOffset = minPs;
  const psFactor = maxPs - minPs;
  map['ps'] = psData.reduce((acc, e, index) => ({...acc, [e]: (e - psOffset) / psFactor}), {});
  // console.log('ps', map['ps']);

  const kmData = data['kilometerstand'].map((e) => parseInt(e.input, 10));
  const minKm = Math.min(...kmData);
  const maxKm = Math.max(...kmData);
  const kmOffset = minKm;
  const kmFactor = maxKm - minKm;
  map['kilometerstand'] = kmData.reduce((acc, e, index) => ({...acc, [e]: (e - kmOffset) / kmFactor}), {});
  // console.log('kilometerstand', map['kilometerstand']);

  const ezData = data['erstzulassung'].map((e) => new Date(e.input).getTime());
  const minEz = Math.min(...ezData);
  const maxEz = Math.max(...ezData);
  const ezOffset = minEz;
  const ezFactor = maxEz - minEz;
  map['erstzulassung'] = ezData.reduce((acc, e, index) => ({...acc, [e]: (e - ezOffset) / ezFactor}), {});
  // console.log('erstzulassung', map['erstzulassung']);

  set = data['gebiet'].reduce((acc, e) => acc.add(e.input), new Set());
  map['gebiet'] = Array.from(set).reduce((acc, e, index) => ({...acc, [e]: index / (set.size - 1)}), {});
  // console.log('gebiet', map['gebiet']);

  const vdData = data['verkaufsdatum'].map((e) => new Date(e.input).getTime());
  const minVd = Math.min(...vdData);
  const maxVd = Math.max(...vdData);
  const vdOffset = minVd;
  const vdFactor = maxVd - minVd;
  map['verkaufsdatum'] = vdData.reduce((acc, e, index) => ({...acc, [e]: (e - vdOffset) / vdFactor}), {});
  // console.log('verkaufsdatum', map['verkaufsdatum']);

  // console.log('rawData', rawData);
  // console.log('marke', map['marke']);
  // console.log('marke', map['marke']['audi']);
  const mappedData = rawData.map((e) => {
    const entry = {};
    Object.keys(map).forEach((key) => {
      entry[key] = map[key][e[key]];
    });
    return entry;
  });
  console.log('mappedData', mappedData);

  // var net = new brain.NeuralNetwork();
  // console.log('Training...');
  // net.train(data, {
  //   // Defaults values --> expected validation
  //   iterations: 200, // the maximum times to iterate the training data --> number greater than 0
  //   errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
  //   log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
  //   logPeriod: 10, // iterations between logging out --> number greater than 0
  //   learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
  //   momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
  //   callback: null, // a periodic call back that can be triggered while training --> null or function
  //   callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
  //   timeout: 30 * 1000 // the max number of milliseconds to train for --> number greater than 0
  // });
  // console.log('Finished training!');


});

//
// writeStream.write('df5139dd7f9cc68f544c58782c8b8f037afb5fb0f9ffc2c23110846e1ed1ece5' + '\n');
// // writeStream.write('4b9c472869462dd1f155a002860b963f689699f8a1afe965131ea2392441c60d' + '\n');
// // writeStream.write('016dc8cd9f1092dfc9d7081c6bcc06d2aa89e7a380b8531130d6a79b990c8645' + '\n');
// writeStream.write('Ingolais krasse Abgabe' + '\n');
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




