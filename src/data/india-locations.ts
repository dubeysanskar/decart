/**
 * States and union territories with the cities we actually deliver to often enough to list —
 * district headquarters, industrial towns and the metros. It is deliberately not exhaustive:
 * every state ends with an "Other" escape in the form, so a buyer in a town we have not listed
 * can still type it in rather than being blocked by a dropdown.
 *
 * Used by the lead form: picking a state filters the city list to that state.
 */

export type StateRecord = { name: string; cities: string[] };

export const INDIA_STATES: StateRecord[] = [
  {
    name: 'Andhra Pradesh',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Kadapa'],
  },
  {
    name: 'Arunachal Pradesh',
    cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  },
  {
    name: 'Assam',
    cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon'],
  },
  {
    name: 'Bihar',
    cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
  },
  {
    name: 'Chhattisgarh',
    cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur'],
  },
  {
    name: 'Goa',
    cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  },
  {
    name: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch', 'Vapi', 'Mehsana', 'Navsari'],
  },
  {
    name: 'Haryana',
    cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bahadurgarh', 'Manesar', 'Rewari', 'Bhiwani'],
  },
  {
    name: 'Himachal Pradesh',
    cities: ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Baddi', 'Kullu', 'Bilaspur', 'Una'],
  },
  {
    name: 'Jharkhand',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Hazaribagh', 'Deoghar', 'Giridih'],
  },
  {
    name: 'Karnataka',
    cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi'],
  },
  {
    name: 'Kerala',
    cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad', 'Kottayam', 'Malappuram'],
  },
  {
    name: 'Madhya Pradesh',
    cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli'],
  },
  {
    name: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 'Ahmednagar', 'Chakan'],
  },
  {
    name: 'Manipur',
    cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  },
  {
    name: 'Meghalaya',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongstoin'],
  },
  {
    name: 'Mizoram',
    cities: ['Aizawl', 'Lunglei', 'Champhai'],
  },
  {
    name: 'Nagaland',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  },
  {
    name: 'Odisha',
    cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Angul'],
  },
  {
    name: 'Punjab',
    cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Moga', 'Phagwara'],
  },
  {
    name: 'Rajasthan',
    cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar', 'Bharatpur', 'Neemrana'],
  },
  {
    name: 'Sikkim',
    cities: ['Gangtok', 'Namchi', 'Gyalshing'],
  },
  {
    name: 'Tamil Nadu',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Hosur', 'Sriperumbudur'],
  },
  {
    name: 'Telangana',
    cities: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar'],
  },
  {
    name: 'Tripura',
    cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
  },
  {
    name: 'Uttar Pradesh',
    cities: ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Saharanpur', 'Jhansi', 'Mathura'],
  },
  {
    name: 'Uttarakhand',
    cities: ['Dehradun', 'Haridwar', 'Rudrapur', 'Haldwani', 'Roorkee', 'Kashipur', 'Rishikesh', 'Nainital'],
  },
  {
    name: 'West Bengal',
    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Kharagpur', 'Malda', 'Haldia'],
  },

  // union territories
  {
    name: 'Andaman & Nicobar Islands',
    cities: ['Port Blair'],
  },
  {
    name: 'Chandigarh',
    cities: ['Chandigarh'],
  },
  {
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    cities: ['Silvassa', 'Daman', 'Diu'],
  },
  {
    name: 'Delhi',
    cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Rohini', 'Okhla', 'Narela'],
  },
  {
    name: 'Jammu & Kashmir',
    cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  },
  {
    name: 'Ladakh',
    cities: ['Leh', 'Kargil'],
  },
  {
    name: 'Lakshadweep',
    cities: ['Kavaratti'],
  },
  {
    name: 'Puducherry',
    cities: ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'],
  },
];

/** The escape hatch — the list can never cover every town in India. */
export const OTHER_CITY = 'Other';

export const citiesFor = (state: string) =>
  INDIA_STATES.find((record) => record.name === state)?.cities ?? [];
