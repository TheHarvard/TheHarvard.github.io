
// This is an overview of the topic namespace


// architecture:
//
// - Node 
//   A statefull object dynamically syncronized across distributed devices
//
// - Event
//   A message posted by a node
//
// - Subscription
//   A stateless relation that routes events from one node to another
//
// - Virtual Hardware Endpoint
//   A statefull object
//


// Implementation Strategy
//
// stateMachine.json
// Defines all states and behaviour of the universal state machine
//
// configuration.json
// Defines device specific implemented patterns
//
// controlNode.js and controlNode.c
// Both implements reading and executing the above JSON


// json format
//
// js and c needsto implement the following:
// - state
// -- id
// -- 
//
// - node
// -- default state
//
let json1 = {"objectElement1":"string","objectElement1":1};
//
let jsonState = {"transition1":"string","objectElement1":1};
let jsonState2 = {"transition1":"string","objectElement1":1};



// ESPnow has 250 Byte size limit
// types of messages:
// - Event (open ended)
// - Command (includes callback)
// - Subscribe (Registers a subscription)


// ship/1/
// Ship/1/
// 01/01/

//TOPIC
// 00 11 22 33 44 FF
// Each byte is a ennumerated topic level
// 00 is wild/any 
// FF is end of topic

//VALUE
// first bit 1 = Integer
// first bit 0 = String


// namespace encoding (or should i use ennumeration?)
// - Ascii
// - lowercase only
// - 0 - 000000
// - 1 - 000001
// - 2 - 000010
// - 3 - 000011
// - 4 - 000100
// - 5 - 000101
// - 6 - 000110
// - 7 - 000111
// - 8 - 001000
// - 9 - 001001
// - a - 001010
// - b - 001011
// - c - 001100
// - d - 001101
// - e - 001110
// - f - 001111
// - g - 010000
// - h - 010001
// - i - 010010
// - j - 010011
// - k - 010100
// - l - 010101
// - m - 010110
// - n - 010111
// - o - 011000
// - p - 011001
// - q - 011010
// - r - 011011
// - s - 011100
// - t - 011101
// - u - 011110
// - v - 011111
// - x - 100000
// - y - 100001
// - z - 100010
// - A - 100011
// - B - 100100
// - C - 100101
// - D - 100110
// - E - 100111
// - F - 101000
// - G - 101001
// - H - 101010
// - I - 101011
// - J - 101100
// - K - 101101
// - L - 101110
// - M - 101111
// - N - 110000
// - _ - 110001
// - Q - 110010 - Variable Q
// - R - 110011 - Variable R
// - S - 110100 - Variable S
// - T - 110101 - Variable T
// - U - 110110 - Variable U
// - V - 110111 - Variable V
// - X - 111000 - Variable X
// - Y - 111001 - Variable Y
// - Z - 111010 - Variable Z
// - 60- 111011 - Constant marker?
// - - - 111100 - range
// - * - 111101 - Wildcard
// - & - 111110 - Alias Delimiter
// - / - 111111 - Delimiter
// + single level wildcard
// # multi level wildcard
// $ wildcard exception

// Wilcard Behaviour
// * Character wildcard
// +
// $ Wildcard exception, any name starting with $ is excempt from wildcards

// example path:
// ship/1/system/1/make_on
// sh/1/sy/1/1
// 000001 010001 111111
//
// Example Subscription:
// 
// from: ship/1/system/1/null to: ship/1/system/2/setValue
// sh/1/sy/1/#sh/1/sy/2/sv
//
// from: ship/X/system/Y/null to: ship/X/system/Y/setValue
// sh/1/sy/1/#sh/1/sy/2/sv
// sh1sy1/#sh1sy2/sv -> 13 bytes
// Integer -> 4 bytes
// long integer -> 8 bytes


// an object is only created when it first recieves an event.
// How many objects can i store in ram?
// Each object stores:
// identifier, ~16 bytes
// state, 4 bytes (ennumerated)
// value, 4 bytes
// list, varies
// 25 bytes = 400 objects per kB

// 6 Bytes can contain 8, 6 bit characters
// 111111110000000011111111000000001111111100000000
// 111111000000111111000000111111000000111111000000
// 12 Bytes (3 integers), can contain 24 characters





// event ennumeration (INPUT EVENTS)
//
// - 0 - 000000 - null - null
// - 1 - 000001 - set_value - 
// - 2 - 000010 - make_on
// - 3 - 000011 - make_off
// - 4 - 000100 - make_toggle
// - 5 - 000101 - make_cycle3
// - 6 - 000110 - make_cycle4
// - 7 - 000111 - increment
// - 8 - 001000 - decrement
// - 9 - 001001 - make_tripped
// - a - 001010 - make_untripped
// - b - 001011 - make_faulty
// - c - 001100 - make_unfaulty
// - d - 001101 - make_unavailable
// - e - 001110 - make_available
// - f - 001111
// - g - 010000
// - h - 010001
// - i - 010010
// - j - 010011
// - k - 010100
// - l - 010101
// - m - 010110
// - n - 010111
// - o - 011000
// - p - 011001
// - q - 011010
// - r - 011011
// - s - 011100
// - t - 011101
// - u - 011110
// - v - 011111
















// ESP-now message examples (250 Bytes)

// Topic
// Value

// First Byte:
// > "S" - message is a string
// > "I" - message is a integer













// datatypes

// integer (32bit)

// string

// Pointer
// > Device
// > ID on Device
// > Literal value

// Subscription
// > Priority > 1
// > TriggeringEvent > 
// > TriggeringObject > Object of Origin
// > TriggeredFunction > 
// > TriggeredObject > 
// > EventAlias > 
// > EventAliasObject > 

// Event
// > 

// Command

// StateMachine
// > self > Pointer
// > StartingState > Pointer
// > CurrentState > Pointer











// The Universal State Machine
// States
// > On
// > On2/3
// > On1/2
// > On1/3
// > Off (default state)
//
// > Enabled / Available
// > Disabled / Unavailable
// > Faulty
// > Tripped
// > FaultyDisabled
// Values

// Input Events
// > make_enable
// > make_disable

// Output Events
// > value
// > newstate
// > indicateOn
// > indicateOff
// > indicateHalf
// > indicateOneThird
// > indicateTwoThird
// > indicateFault
// > indicateTrip
// > indicateAvail
// > indicateUnavail
// > indicateMan
// > indicateAuto












// Virtual Hardware Endpoint
// Endpoints are implemented per device and not shared or syncronized
// Subscriptions to Endpoints do not propagate the events across devices

//Identifier
// _ship/1/system/1...

// Input Events
// - Set state
// - Set value
// - multiplexValue
// - Set address

// Mode: 
// - Digital Input
// - Digital Output
// - Analog Input
// - Analog Output
// - UnsignedBinary Input
// - UnsignedBinary Output
// - Meter Input (give the values of the index of the highest "on" input in an array)
// - Meter Output (Value 1 = output 1 is on, Value 3 = output 1,2 and 3 is on)
// - 7-Segment Output (renders string on 7 segment display) - _-1234567890AbCdEFGHIJLnoPqrStuy and special "."
// - Audio Out

// address:
// simple: "htmlElementX" on html, or "d12" on mc
// range: "htmlElementX, htmlElementY, htmlElementZ" or "d12,d13,d14"
// ScanMultiplexing: "[activePin, commonPin],[d1,d2]"
//
// HTML and Hardware should actually have the same address to simplify simulation

// Invert: (Inverts the logical digital states, or reverses the ranges)

// MultiplexCondition (Not hardware scan multiplexing, but functional multiplex)
// - When true, operates normally
// - When false, disconnects from actual hardware but keeps states
// - when a statefull switch is multiplexed there should be an indicator light blinking to indicate that it is not aligned to the actual value if there is such an issue.

// States
// - Digital On 
// - Digital Off
// - Blink [Period]
// - InvBlink [Period]
