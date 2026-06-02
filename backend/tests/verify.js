import '../config/env.js';

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { AuthController } from '../controllers/AuthController.js';
import { User } from '../models/User.js';

const authController = new AuthController();

const makeMockResponse = () => {
  const res = {};
  let statusSet = 200;
  let responseData = null;
  let cookies = {};

  res.status = (code) => {
    statusSet = code;
    return res;
  };

  res.json = (data) => {
    responseData = data;
    return res;
  };

  res.cookie = (name, val, _options) => {
    cookies[name] = val;
    return res;
  };

  res.clearCookie = (name, _options) => {
    delete cookies[name];
    return res;
  };

  return {
    res,
    getStatus: () => statusSet,
    getData: () => responseData,
    getCookies: () => cookies,
  };
};

const runTests = async () => {
  console.log('\n==================================================');
  console.log('STARTING FIXCONNECT AUTHENTICATION INTEGRATION TESTS (JS)');
  console.log('==================================================\n');

  await connectDB();

  const testEmail = 'test-auth-js@example.com';
  await User.deleteOne({ email: testEmail });
  console.log(`[Setup] Cleaned up any existing test user: ${testEmail}`);

  // Test Case 1: Register User
  console.log('\n[TC 1] Testing User Registration...');
  const regReq = {
    body: {
      name: 'John Test JS',
      email: testEmail,
      password: 'securePassword123',
      role: 'customer',
    },
  };

  const regRes = makeMockResponse();
  
  await authController.register(
    regReq,
    regRes.res,
    (err) => { throw err; }
  );

  if (regRes.getStatus() === 201) {
    console.log('✅ Registration Succeeded (Status 201)!');
    console.log(`   Message: ${regRes.getData().message}`);
  } else {
    throw new Error(`TC 1 Failed: Expected status 201, got ${regRes.getStatus()}`);
  }

  const dbUserBefore = await User.findOne({ email: testEmail }).select('+verificationToken +verificationTokenExpiresAt');
  if (dbUserBefore && !dbUserBefore.isVerified && dbUserBefore.verificationToken) {
    console.log('✅ User correctly saved in database with isVerified: false and verification token generated!');
  } else {
    throw new Error('TC 1 Failed: DB state is incorrect');
  }

  // Test Case 2: Login unverified
  console.log('\n[TC 2] Testing Login with Unverified Email...');
  const unverifiedLoginReq = {
    body: {
      email: testEmail,
      password: 'securePassword123',
    },
  };

  const unverifiedLoginRes = makeMockResponse();
  let tc2Passed = false;

  try {
    await authController.login(
      unverifiedLoginReq,
      unverifiedLoginRes.res,
      (err) => {
        if (err && err.statusCode === 403) {
          console.log(`✅ Correctly blocked login for unverified user (Status 403 Forbidden)!`);
          console.log(`   Message: ${err.message}`);
          tc2Passed = true;
        } else {
          throw err;
        }
      }
    );
  } catch (err) {
    if (!tc2Passed) {
      throw err;
    }
  }

  // Test Case 3: Email Verification
  console.log('\n[TC 3] Testing Email Verification...');
  const verifyReq = {
    query: {
      token: dbUserBefore.verificationToken,
    },
  };

  const verifyRes = makeMockResponse();

  await authController.verifyEmail(
    verifyReq,
    verifyRes.res,
    (err) => { throw err; }
  );

  if (verifyRes.getStatus() === 200) {
    console.log('✅ Verification Succeeded (Status 200)!');
    console.log(`   Message: ${verifyRes.getData().message}`);
  } else {
    throw new Error(`TC 3 Failed: Expected status 200, got ${verifyRes.getStatus()}`);
  }

  const dbUserAfter = await User.findOne({ email: testEmail });
  if (dbUserAfter && dbUserAfter.isVerified) {
    console.log('✅ DB user correctly marked isVerified: true!');
  } else {
    throw new Error('TC 3 Failed: DB state was not updated to verified');
  }

  // Test Case 4: Login Verified
  console.log('\n[TC 4] Testing Login with Verified Email...');
  const loginReq = {
    body: {
      email: testEmail,
      password: 'securePassword123',
    },
  };

  const loginRes = makeMockResponse();

  await authController.login(
    loginReq,
    loginRes.res,
    (err) => { throw err; }
  );

  if (loginRes.getStatus() === 200) {
    console.log('✅ Login Succeeded (Status 200)!');
    console.log(`   Access Token received: ${loginRes.getData().data.accessToken.substring(0, 30)}...`);
    console.log(`   Refresh Token cookie successfully set: ${loginRes.getCookies().refreshToken.substring(0, 30)}...`);
  } else {
    throw new Error(`TC 4 Failed: Expected status 200, got ${loginRes.getStatus()}`);
  }

  // Test Case 5: Refresh rotation
  console.log('\n[TC 5] Testing Refresh Token Rotation...');
  const refreshReq = {
    cookies: {
      refreshToken: loginRes.getCookies().refreshToken,
    },
    body: {},
  };

  const refreshRes = makeMockResponse();

  await authController.refreshToken(
    refreshReq,
    refreshRes.res,
    (err) => { throw err; }
  );

  if (refreshRes.getStatus() === 200) {
    console.log('✅ Refresh Token Succeeded (Status 200)!');
    console.log(`   New Access Token received: ${refreshRes.getData().data.accessToken.substring(0, 30)}...`);
    console.log(`   New Refresh Token cookie set: ${refreshRes.getCookies().refreshToken.substring(0, 30)}...`);
  } else {
    throw new Error(`TC 5 Failed: Expected status 200, got ${refreshRes.getStatus()}`);
  }

  // Test Case 6: Forgot Password
  console.log('\n[TC 6] Testing Forgot Password...');
  const forgotReq = {
    body: {
      email: testEmail,
    },
  };

  const forgotRes = makeMockResponse();

  await authController.forgotPassword(
    forgotReq,
    forgotRes.res,
    (err) => { throw err; }
  );

  if (forgotRes.getStatus() === 200) {
    console.log('✅ Forgot password link dispatched (Status 200)!');
  } else {
    throw new Error(`TC 6 Failed: Expected status 200, got ${forgotRes.getStatus()}`);
  }

  const dbUserReset = await User.findOne({ email: testEmail }).select('+resetPasswordToken +resetPasswordExpiresAt');
  if (dbUserReset && dbUserReset.resetPasswordToken) {
    console.log('✅ DB correctly updated with reset token and expiration time!');
  } else {
    throw new Error('TC 6 Failed: Reset password fields not saved in DB');
  }

  // Test Case 7: Reset Password Action
  console.log('\n[TC 7] Testing Reset Password...');
  const resetReq = {
    params: {
      token: dbUserReset.resetPasswordToken,
    },
    body: {
      password: 'newSecurePassword456',
    },
  };

  const resetRes = makeMockResponse();

  await authController.resetPassword(
    resetReq,
    resetRes.res,
    (err) => { throw err; }
  );

  if (resetRes.getStatus() === 200) {
    console.log('✅ Password Reset Succeeded (Status 200)!');
  } else {
    throw new Error(`TC 7 Failed: Expected status 200, got ${resetRes.getStatus()}`);
  }

  // Test Case 8: Try login with old password
  console.log('\n[TC 8] Testing Login with Old Password...');
  const loginOldReq = {
    body: {
      email: testEmail,
      password: 'securePassword123',
    },
  };

  const loginOldRes = makeMockResponse();
  let tc8Passed = false;

  try {
    await authController.login(
      loginOldReq,
      loginOldRes.res,
      (err) => {
        if (err && err.statusCode === 401) {
          console.log('✅ Successfully rejected old credentials (Status 401 Unauthorized)!');
          tc8Passed = true;
        } else {
          throw err;
        }
      }
    );
  } catch (err) {
    if (!tc8Passed) {
      throw err;
    }
  }

  // Test Case 9: Login with new password
  console.log('\n[TC 9] Testing Login with New Password...');
  const loginNewReq = {
    body: {
      email: testEmail,
      password: 'newSecurePassword456',
    },
  };

  const loginNewRes = makeMockResponse();

  await authController.login(
    loginNewReq,
    loginNewRes.res,
    (err) => { throw err; }
  );

  if (loginNewRes.getStatus() === 200) {
    console.log('✅ Login with new password succeeded (Status 200)!');
  } else {
    throw new Error(`TC 9 Failed: Expected status 200, got ${loginNewRes.getStatus()}`);
  }

  await User.deleteOne({ email: testEmail });
  await mongoose.connection.close();
  
  console.log('\n==================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED TRIUMPHANTLY! 🎉');
  console.log('==================================================\n');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED!\n', err);
  mongoose.connection.close();
  process.exit(1);
});
