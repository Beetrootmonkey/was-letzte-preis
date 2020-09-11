const readline = require('readline');
const fs = require('fs');
const brain = require('brain.js');
const trainingData = require('./WasLetztePreis_trainingData.json');
const missingData = require('./WasLetztePreis_missingData.json');
const writeStream = fs.createWriteStream('./WasLetztePreis_output.txt', {
  // flags: 'a' // 'a' means appending (old data will be preserved)
});


const netOptions = {
  activation: 'sigmoid', // activation function
  hiddenLayers: [10],
};

const trainingOptions = {
  // Defaults values --> expected validation
  iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
  errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
  log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
  logPeriod: 10, // iterations between logging out --> number greater than 0
  learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
  momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
  callback: null, // a periodic call back that can be triggered while training --> null or function
  callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
  timeout: Infinity // the max number of milliseconds to train for --> number greater than 0
};

// var net = new brain.NeuralNetwork();
const crossValidate = new brain.CrossValidate(brain.NeuralNetwork, netOptions);
const stats = crossValidate.train(trainingData, trainingOptions);
console.log(stats);
const net = crossValidate.toNeuralNetwork();

console.log('Starting Training (' + trainingData.length + ' elements)...');
console.time('Finished training');
net.train(trainingData, trainingOptions);
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




