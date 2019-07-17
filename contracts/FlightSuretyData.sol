pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    mapping (address => bool) private registeredAirlines;
    mapping (address => uint) private fundedAirlines;

    mapping(address =>uint) supportFor; //Votes for an airline

    address[] public ArrayOfAirlines;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address firstAirline) public
    {
        contractOwner = msg.sender;
        registeredAirlines[firstAirline] = true;
        fundedAirlines[firstAirline] += 10;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/
    /**


    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()public view returns(bool)
    {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode) external requireContractOwner
    {
        operational = mode;
    }

    function isAirlineRegistered(address airline) external view returns (bool) {
        return registeredAirlines[airline];
    }

    function isAirlineFunded(address airline) external view returns (uint) {

        return fundedAirlines[airline];
    }

    function numberOfAirlines() external view returns (uint) {
        return ArrayOfAirlines.length;
    }

    function registerAirlineVote(address airline) external {
        supportFor[airline] = supportFor[airline] + 1;
    }

    function numberOfAirlineVotes(address airline) external view returns (uint) {
        return supportFor[airline];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address airline) external requireIsOperational returns (bool)
    {
        //Adds a new airline to the mapping
        registeredAirlines[airline] = true;
        ArrayOfAirlines.push(airline); //To monitor number of airlines.
        return registeredAirlines[airline];
    }

    function fundAirline(address airline, uint amount) external returns (uint) {
        fundedAirlines[airline] += amount;
        return fundedAirlines[airline];
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy() external payable requireIsOperational
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees() external requireIsOperational
    {
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external requireIsOperational
    {

    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund() public payable requireIsOperational
    {
    }

    function getFlightKey(address airline,string flight,uint256 timestamp) external requireIsOperational returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable requireIsOperational
    {
        fund();
    }


}

