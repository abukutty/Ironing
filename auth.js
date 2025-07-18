// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyByWJ-maqxgyuyo79DJab8QbatAr7Rq-8w",
    authDomain: "fir-a854c.firebaseapp.com",
    databaseURL: "https://fir-a854c-default-rtdb.firebaseio.com",
    projectId: "fir-a854c",
    storageBucket: "fir-a854c.firebasestorage.app",
    messagingSenderId: "39658546704",
    appId: "1:39658546704:web:42c5190755d451cbf98c95",
    measurementId: "G-KG4XS7C5Y0"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Elements
  const message = document.getElementById("message");
  function showStep(id) {
    ["step1", "step2", "step3", "step4", "step5", "resetStep"].forEach(s => {
      document.getElementById(s).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
    message.textContent = "";
  }
  
  // OTP Logic
  let otpCode = "";
  let tempEmail = "";
  
  function sendEmailOtp(toEmail) {
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    return emailjs.send("service_dfs7t3l", "template_pd5umbl", {
      to_email: toEmail,
      otp: otpCode
    });
  }
  
  // Step 1
  const emailInput = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const forgotBtn = document.getElementById("forgotBtn");
  
  loginBtn.onclick = async () => {
    const email = emailInput.value;
    const pass = password.value;
    if (!email || !pass) return message.textContent = "Enter all fields.";
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, pass);
      const doc = await db.collection("users").doc(userCredential.user.uid).get();
      userName.textContent = doc.exists ? doc.data().name : email;
      showStep("step5");
    } catch (err) {
      message.textContent = err.message;
    }
  };
  
  signupBtn.onclick = () => {
    showStep("step2");
  };
  
  forgotBtn.onclick = () => {
    showStep("resetStep");
  };
  
  // Step 2
  const signupEmail = document.getElementById("signupEmail");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const backToLogin1 = document.getElementById("backToLogin1");
  
  sendOtpBtn.onclick = async () => {
    const email = signupEmail.value;
    if (!email) return message.textContent = "Enter your email.";
    try {
      const methods = await auth.fetchSignInMethodsForEmail(email);
      if (methods.length > 0) return message.textContent = "Email already in use.";
      await sendEmailOtp(email);
      tempEmail = email;
      showStep("step3");
    } catch (err) {
      message.textContent = err.message;
    }
  };
  
  backToLogin1.onclick = () => showStep("step1");
  
  // Step 3
  const otpInput = document.getElementById("otpInput");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  
  verifyOtpBtn.onclick = () => {
    if (otpInput.value === otpCode) {
      showStep("step4");
    } else {
      message.textContent = "Incorrect OTP.";
    }
  };
  
  // Step 4
  const nameInput = document.getElementById("nameInput");
  const newSignupPass = document.getElementById("newSignupPass");
  const createAccountBtn = document.getElementById("createAccountBtn");
  const userName = document.getElementById("userName");
  
  createAccountBtn.onclick = async () => {
    const name = nameInput.value;
    const pass = newSignupPass.value;
    if (!name || !pass) return message.textContent = "Fill all fields.";
    try {
      const userCred = await auth.createUserWithEmailAndPassword(tempEmail, pass);
      await db.collection("users").doc(userCred.user.uid).set({ name });
      userName.textContent = name;
      showStep("step5");
    } catch (err) {
      message.textContent = err.message;
    }
  };
  
  // Step 5
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  
  logoutBtn.onclick = () => {
    auth.signOut();
    showStep("step1");
  };
  
  deleteBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await db.collection("users").doc(user.uid).delete();
    await user.delete();
    showStep("step1");
  };
  
  // Password Reset
  const resetEmail = document.getElementById("resetEmail");
  const sendResetOtp = document.getElementById("sendResetOtp");
  const resetOtp = document.getElementById("resetOtp");
  const newPass = document.getElementById("newPass");
  const confirmNewPass = document.getElementById("confirmNewPass");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const backToLogin2 = document.getElementById("backToLogin2");
  
  sendResetOtp.onclick = async () => {
    const email = resetEmail.value;
    if (!email) return message.textContent = "Enter your email.";
    try {
      const methods = await auth.fetchSignInMethodsForEmail(email);
      if (methods.length === 0) return message.textContent = "Email not found.";
      await sendEmailOtp(email);
      tempEmail = email;
      message.textContent = "OTP sent.";
    } catch (err) {
      message.textContent = err.message;
    }
  };
  
  changePasswordBtn.onclick = async () => {
    if (resetOtp.value !== otpCode) return message.textContent = "Wrong OTP.";
    const np = newPass.value, cp = confirmNewPass.value;
    if (np !== cp) return message.textContent = "Passwords do not match.";
    try {
      await auth.sendPasswordResetEmail(tempEmail);
      message.textContent = "Check your email to reset your password.";
    } catch (err) {
      message.textContent = err.message;
    }
  };
  
  backToLogin2.onclick = () => showStep("step1");
  