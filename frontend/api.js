import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = "3000";

const removeTrailingSlash = (url) => url.replace(/\/+$/, "");

const parseHostFromUri = (hostUri) => {
  if (!hostUri) return null;

  const normalized = hostUri
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .split("/")[0]
    .trim();

  if (!normalized) return null;
  return normalized.split(":")[0];
};

const isLikelyReachableDevHost = (host) => {
  if (!host) return false;
  return /^(localhost|(?:\d{1,3}\.){3}\d{1,3}|[a-z0-9-]+\.local)$/i.test(host);
};

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  const parsedHost = parseHostFromUri(hostUri);
  if (!isLikelyReachableDevHost(parsedHost)) return null;

  return parsedHost;
};

const resolveBaseURL = () => {
  const envBaseURL = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envBaseURL) {
    return removeTrailingSlash(envBaseURL);
  }

  // In Expo Go/dev mode, prefer LAN host so real devices can hit backend.
  const expoHost = getExpoHost();
  if (expoHost) {
    // Avoid localhost for native clients because real devices cannot reach it.
    if ((expoHost === 'localhost' || expoHost === '127.0.0.1') && Platform.OS !== 'web') {
      if (Platform.OS === 'android') {
        return `http://10.0.2.2:${API_PORT}`;
      }
      return `http://localhost:${API_PORT}`;
    }

    return `http://${expoHost}:${API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
};

class ApiService {
  static instance = null;

  constructor(baseURL) {
    if (ApiService.instance) {
      return ApiService.instance;
    }
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    ApiService.instance = this;
  }

  async request(method, path, data) {
    const response = await this.api.request({
      method,
      url: path,
      data,
    });

    return response.data;
  }

  getBaseURL() {
    return this.baseURL;
  }

  async UserCreateAccount(userData) {
    return this.request('post', '/Users', userData);
  }

  async UserLoginAccount(userData) {
    return this.request('post', '/Users/Login', userData);
  }

  async Chapter2InputData(userData, userID, recordID = null) {
    const url = recordID ? `/chapter2/${userID}/${recordID}` : `/chapter2/${userID}`;
    return this.request('post', url, userData);
  }

  async Chapter2FetchData(recordID) {
    return this.request('get', `/chapter2/${recordID}`);
  }

  async Chapter2AfterChoosingMonitor(recordID, selectMonitorID) {
    return this.request('post', `/chapter2/update/monitor/${recordID}`, { selectMonitorID });
  }

  async Chapter3BeforeChoosingChain(recordID) {
    return this.request('get', `/chapter3/${recordID}`);
  }

  async Chapter3Calculation(recordID, userData) {
    return this.request('post', `/chapter3/calculation/${recordID}`, userData);
  }

  async Chapter4PreData(recordID) {
    return this.request('get', `/chapter4/${recordID}`);
  }

  async Chapter4Calculation(recordID, userData) {
    return this.request('post', `/chapter4/calculation/${recordID}`, userData);
  }

  async Chapter4SecondCalculation(recordID, userData) {
    return this.request('post', `/chapter4/secondcalculation/${recordID}`, userData);
  }

  async Chapter5Calculation(recordID, userInput) {
    return this.request('post', `/chapter5/${recordID}`, userInput);
  }

  async Chapter5SecondCalculation(recordID, userInput) {
    return this.request('post', `/chapter5/secondcalculation/${recordID}`, userInput);
  }

  async Chapter5RecordSave(recordID, userInput) {
    return this.request('post', `/chapter5/saverecord/${recordID}`, userInput);
  }
  
  async FetchReportData(recordID) {
    return this.request('post', `/fetchcalculation/${recordID}`);
  }

  async FetchHistoryData(userID) {
    return this.request('get', `/fetchhistory/${userID}`);
  }

  async FetchReportDataHistory(recordID) {
    return this.request('post', `/fetchsecondcalculation/${recordID}`);
  }

  async DeleteRecord(recordID) {
    return this.request('get', `/deleterecord/${recordID}`);
  }

  async GetUser(userID) {
    return this.request('get', `/getuser/${userID}`);
  }

  async CountTotalRecord(userID) {
    return this.request('get', `/countrecord/${userID}`);
  }
}

// Singleton instance
const apiService = new ApiService(resolveBaseURL());

export default apiService;
