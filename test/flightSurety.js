
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      
      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) Can Register an Airline only if funded and caller is registerd.', async () => {
    // ARRANGE
    let newAirline = accounts[2];
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {
    }
    let result0 = await config.flightSuretyData.isAirlineRegistered.call(config.firstAirline); 
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 
    let result2 = await config.flightSuretyData.isAirlineFunded.call(newAirline);
    let result3 = await config.flightSuretyData.numberOfAirlines.call();
    // ASSERT
    
    assert.equal(result0, true, "Owner Airline not Registered.");
    assert.equal(result, true, "New Airline not Registered.");
    assert.equal(result2, 10, "Airline should not be able to register another airline if it hasn't provided funding.");
    assert.equal(result3, 1, "Number of airlines does not reflect correct number.");
  });

  it('(airline) Unknown airlines cannot register new airlines.', async () => {
    // ARRANGE
    let unknownNewAirline = accounts[3];
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(unknownNewAirline, {from: unknownNewAirline});
    }
    catch(e) {
    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(unknownNewAirline); 

    // ASSERT
    assert.equal(result, false, "Unknown Airline should not register new airlines.");

  });

  it('(airline) Cannot register more than 4 airlines without consensus.', async () => {
    // ARRANGE
    let newAirline = accounts[2];
    let newAirline2 = accounts[4];
    let newAirline3 = accounts[5];
    let newAirline4 = accounts[6];
    let newAirline5 = accounts[7];

    // ACT 1
    try {
        await config.flightSuretyApp.registerAirline(newAirline2, {from: config.firstAirline});
    }
    catch(e) {
    }
    // ACT 2
    try {
        await config.flightSuretyApp.registerAirline(newAirline3, {from: config.firstAirline});
    }
    catch(e) {
    }
    // ACT 3
    try {
        await config.flightSuretyApp.registerAirline(newAirline4, {from: config.firstAirline});
    }
    catch(e) {
    }
    // ACT 4
    try {
        await config.flightSuretyApp.registerAirline(newAirline5, {from: config.firstAirline});
    }
    catch(e) {
    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 
    let result2 = await config.flightSuretyData.isAirlineRegistered.call(newAirline2); 
    let result3 = await config.flightSuretyData.isAirlineRegistered.call(newAirline3); 
    let result4 = await config.flightSuretyData.isAirlineRegistered.call(newAirline4); 
    let result5 = await config.flightSuretyData.isAirlineRegistered.call(newAirline5); 
    let result6 = await config.flightSuretyData.numberOfAirlines.call();

    // ASSERT
    assert.equal(result, true, "New Airline not Registered.");
    assert.equal(result2, true, "New Airline2 not Registered.");
    assert.equal(result3, true, "New Airline3 not Registered.");
    assert.equal(result4, true, "New Airline4 not Registered.");
    assert.equal(result5, false, "New Airline5 should not be registered without consensys.");
    assert.equal(result6, 4, "New Airline5 should not be registered.");
  });

  it('(airline) More than four airlines uses consensys.', async () => {
    // ARRANGE
    let newAirline = accounts[2];
    let newAirline2 = accounts[8];

    let result = await config.flightSuretyData.numberOfAirlines.call(); //Get number of airlines (should be four)

        // ACT 1
    try {
         await config.flightSuretyApp.registerAirline(newAirline2, {from: config.newAirline});
        }
    catch(e) {
        }
        let result1 = await config.flightSuretyData.numberOfAirlineVotes.call(newAirline2); 

    // ACT 2
    try {
        await config.flightSuretyApp.registerAirline(newAirline2, {from: config.newAirline});
         }
    catch(e) {
        }
        let result2 = await config.flightSuretyData.numberOfAirlineVotes.call(newAirline2); 

    // ACT 3
    try {
        await config.flightSuretyApp.registerAirline(newAirline2, {from: config.newAirline});
             }
    catch(e) {
            }
        let result3 = await config.flightSuretyData.numberOfAirlineVotes.call(newAirline2); 

    // Test
        assert.equal(result, 4, "Only 4 airliens should be registered at this point.");
        assert.equal(result1, 0, "Vote should be 0");
        assert.equal(result2, 1, "Vote should be 1");
        assert.equal(result3, 3, "Vote should be 3");
  });

});
