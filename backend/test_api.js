import * as fs from 'fs';
const API_URL = 'http://localhost:5000/api';
const OUT_FILE = 'test_output.txt';

function logOutput(text) {
  console.log(text);
  fs.appendFileSync(OUT_FILE, text + '\n');
}

async function runTests() {
  fs.writeFileSync(OUT_FILE, ''); // Clear file
  logOutput("--- LendIQ Backend API Test Script ---");

  // 1. Authenticate to get a token
  let token = null;
  logOutput("\n[Auth] Attempting to register a test loan officer...");
  
  const authPayload = {
    firstName: "Test",
    lastName: "Officer",
    email: `testofficer_${Date.now()}@lendiq.com`,
    password: "password123"
  };

  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authPayload)
  });

  const regData = await regRes.json();
  if (!regRes.ok) {
    logOutput(`Registration failed: ${regData.message}`);
  } else {
    logOutput("Registration successful.");
  }

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: authPayload.email, password: authPayload.password })
  });
  
  const loginData = await loginRes.json();
  
  if (!loginRes.ok) {
     logOutput("Login failed with new user. Attempting fallback login...");
     const fallbackLogin = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "testofficer@lendiq.com", password: "password123" })
     });
     const fallbackData = await fallbackLogin.json();
     token = fallbackData.data?.token || fallbackData.token;
     if (!token && fallbackLogin.headers.get('set-cookie')) {
       const setCookie = fallbackLogin.headers.get('set-cookie');
       const match = setCookie.match(/auth_token=([^;]+)/);
       if (match) token = match[1];
     }
  } else {
     token = loginData.data?.token || loginData.token;
     if (!token && loginRes.headers.get('set-cookie')) {
       const setCookie = loginRes.headers.get('set-cookie');
       const match = setCookie.match(/auth_token=([^;]+)/);
       if (match) token = match[1];
     }
  }

  if (!token) {
    logOutput("Failed to obtain JWT token. Cannot proceed with tests.");
    return;
  }
  
  logOutput("[Auth] Successfully acquired JWT token.\n");

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const basePayload = {
    applicantName: "John Doe",
    dateOfBirth: "1990-01-01",
    maritalStatus: "SINGLE",
    numChildren: 0,
    employmentType: "EMPLOYED",
    employmentDurationYears: 5,
    educationLevel: "HIGHER",
    annualIncome: 5000000,
    ownsVehicle: 1,
    ownsRealEstate: 0,
    housingType: "RENTS",
    numFamilyMembers: 1,
    loanAmount: 1000000,
    loanTermMonths: 12
  };

  const validScenarios = [
    { name: "Valid - Standard High Income Single", payload: { ...basePayload } },
  ];

  const invalidScenarios = [
    { name: "Invalid - Missing Auth Token", payload: { ...basePayload }, noAuth: true },
    { name: "Invalid - Missing Required Fields (annualIncome)", payload: { ...basePayload, annualIncome: undefined } },
    { name: "Invalid - Wrong Enum Type (maritalStatus: COMPLICATED)", payload: { ...basePayload, maritalStatus: "COMPLICATED" } },
    { name: "Invalid - Empty Payload", payload: {} }
  ];

  logOutput("================ VALID REQUESTS ================");
  for (let i = 0; i < validScenarios.length; i++) {
    const scenario = validScenarios[i];
    logOutput(`\n--- Test ${i + 1}: ${scenario.name} ---`);
    logOutput(`REQUEST PAYLOAD:\n${JSON.stringify(scenario.payload, null, 2)}`);
    try {
      const res = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(scenario.payload)
      });
      logOutput(`HTTP Status: ${res.status}`);
      const data = await res.json();
      logOutput(`RESPONSE BODY:\n${JSON.stringify(data, null, 2)}`);
    } catch (e) {
      logOutput(`Request failed: ${e.message}`);
    }
  }

  logOutput("\n================ PROBLEMATIC REQUESTS ================");
  for (let i = 0; i < invalidScenarios.length; i++) {
    const scenario = invalidScenarios[i];
    logOutput(`\n--- Test ${i + 1}: ${scenario.name} ---`);
    logOutput(`REQUEST PAYLOAD:\n${JSON.stringify(scenario.payload, null, 2)}`);
    
    let testHeaders = headers;
    if (scenario.noAuth) {
      testHeaders = { 'Content-Type': 'application/json' };
    }

    try {
      const res = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: testHeaders,
        body: JSON.stringify(scenario.payload)
      });
      logOutput(`HTTP Status: ${res.status}`);
      const data = await res.json();
      logOutput(`RESPONSE BODY:\n${JSON.stringify(data, null, 2)}`);
    } catch (e) {
      logOutput(`Request failed: ${e.message}`);
    }
  }
}

runTests();
