const fs = require('fs');
const brain = require('brain.js');
const {LocalStorage} = require('node-localstorage');
const localStorage = new LocalStorage('./scratch', Number.MAX_VALUE);

const writeStream = fs.createWriteStream('./WasLetztePreis_output.txt', {
  // flags: 'a' // 'a' means appending (old data will be preserved)
});

console.log('Starting...');
console.time('Finished!');

const missingData = JSON.parse(localStorage.getItem('missingData'));
const trainingData = JSON.parse(localStorage.getItem('trainingData'));
const priceOffset = JSON.parse(localStorage.getItem('priceOffset'));
const priceFactor = JSON.parse(localStorage.getItem('priceFactor'));

writeStream.write('df5139dd7f9cc68f544c58782c8b8f037afb5fb0f9ffc2c23110846e1ed1ece5' + '\n');
// // writeStream.write('4b9c472869462dd1f155a002860b963f689699f8a1afe965131ea2392441c60d' + '\n');
// // writeStream.write('016dc8cd9f1092dfc9d7081c6bcc06d2aa89e7a380b8531130d6a79b990c8645' + '\n');
writeStream.write('Ingolais krasse Abgabe' + '\n');

console.log('Starting CrossValidation Training (' + trainingData.length + ' elements)...');
console.time('Finished CrossValidation training');

const netOptions = {
  activation: 'sigmoid', // activation function
  hiddenLayers: [1],
  // timeout: 10                      1: 8.77, 10: 9.43, 20: 9.39, 30: 9.71, 40: 9.41
  // timeout: 60                      1: 8.77, 10:     , 20:     , 30:     , 40:
};

const trainingOptions = {
  // Defaults values --> expected validation
  iterations: 2000, // the maximum times to iterate the training data --> number greater than 0
  errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
  log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
  logPeriod: 10, // iterations between logging out --> number greater than 0
  learningRate: 0.2, // scales with delta to effect training rate --> number between 0 and 1
  momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
  callback: null, // a periodic call back that can be triggered while training --> null or function
  callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
  timeout: 60 * 1000 // the max number of milliseconds to train for --> number greater than 0
};

// var net = new brain.NeuralNetwork();
const crossValidate = new brain.CrossValidate(brain.NeuralNetwork, netOptions);
const stats = crossValidate.train(trainingData, trainingOptions);
console.log(stats);
console.timeEnd('Finished CrossValidation training');

console.log('Starting actual Training...');
console.time('Finished actual training');
const net = crossValidate.toNeuralNetwork();
net.train(trainingData, trainingOptions);
console.timeEnd('Finished actual training');

missingData.forEach((e) => {
  const id = e.id;
  const result = net.run(e.input);
  // console.log(id, result);
  const preis = result[0] * priceFactor + priceOffset;
  // const preis = 3000;
  // console.log(id, preis);
  writeStream.write(id + ' ' + preis + '\n');
});
console.timeEnd('Finished!');
