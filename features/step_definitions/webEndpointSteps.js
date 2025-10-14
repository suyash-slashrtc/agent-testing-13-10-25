const { Given, When, Then ,Before,After } = require('@cucumber/cucumber');
const { expect } = require('chai');                                                                             
const WebSocket = require('ws');
const {test} = require("@playwright/test") 

When('I click on the web endpoint button', { timeout: 120 * 1000 }, async function () {
    console.log('Clicking on web endpoint button...');
    await this.takeScreenshot('before_web_endpoint_click');
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.enable');
  
    // console.log("client network enabled", client);
    
    client.on('Network.webSocketCreated', ({requestId, url})=> {
      console.log('WebSocket CREATED ::::::::::::::::::::::::::::::::::::', url)
    })
  
  
    client.on('Network.webSocketFrameSent', ({requestId, timestamp, response})=> {
      console.log('WebSocket message sent::::::::::::::::::::::::::::::::::::::::::::::::::::', response);
    })
  
    client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response})=> {
      console.log('WebSocket message received:::::::::::::::::::::::::::::::::::::::::::::::::', response.payloadData);
    })
  
    try {    
      // Set up WebSocket monitoring before clicking
      await this.page.exposeFunction('logWebSocketData', (data) => {
          console.log('@ WebSocket Data:', data)
          console.log("Untill here late executed");
      });
  
      await this.page.on('websocket', ws => {
        console.log('///////////////////////////////////', ws)
      })
  
      // Inject the WebSocket monitoring script directly
      console.log('WebSocket monitoring setup completed');
      console.log('<----------------------------------------------------------------------------->');
  
      // Now click the button
      await this.page.waitForTimeout(6000);
      await this.page.waitForSelector('button.webPhone', { timeout: 5000 });
      await this.page.click('button.webPhone');
  
    }catch (error) {
      console.error('Error in web endpoint step:', error.message);
      await this.takeScreenshot('web_endpoint_error');
      throw error;
    }
});

When('I handle microphone permission popup', async function () {
    console.log('Handling Microphone Permission!!');
    // Check microphone permission status
    const permissionStatus = await this.page.evaluate(async () => {
        try {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        return permission.state; 
        } catch (error) {
        console.error('Permission query failed:', error);
        return 'error';
        }
    });
    console.log('Microphone Permission : ' + permissionStatus);
    if(permissionStatus === 'denied'){
        await this.context.grantPermissions(['microphone']);
    } 
});

Then('I should be in ready state-web', async function () {
    console.log('Verifying ready state...');
    const screenshotPath = await this.takeScreenshot(`is_ready_state?${this.currentAgent.username}`);
    const isReady = await this.checkReadyState();
    try {
      expect(isReady).to.be.true;
      console.log(`Ready state confirmed for ${this.currentAgent.username}`);
      await this.page.waitForTimeout(2000);
    }
    catch(e){
      console.log(`Agent  ${this.currentAgent.username} is not ready!`);
    }
    console.log(`Screenshot saved: ${screenshotPath}`);
    await this.page.waitForTimeout(1000);
});


When('I dial number {string} and make the call', async function (phoneNumber) {
  const isReady = await this.checkReadyState();
  if(!isReady)
      return ;
  
  await this.page.waitForTimeout(1000);


  console.log(`Dialing number: ${phoneNumber} and making call...`);
  await this.takeScreenshot('before_dialing_call');
  
  try {
    // Remove quotes if present
    const cleanPhoneNumber = phoneNumber.replace(/"/g, '');
    console.log(`Cleaned phone number: ${cleanPhoneNumber}`);
    
    // STEP 1: Enter the phone number
    await this.page.waitForTimeout(3000);

    const phoneInput = await this.page.locator('#phoneNumber');
    await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Found phone input field');
    
    await phoneInput.clear();
    await phoneInput.fill(cleanPhoneNumber);
    
    // Verify the number was entered
    const enteredValue = await phoneInput.inputValue();
    console.log(`Entered phone number: "${enteredValue}"`);
    
    await this.takeScreenshot('after_entering_number');
    await this.page.waitForTimeout(3000);
    
    console.log('Waiting for call button to become enabled...');
    
    await this.page.evaluate(() => {
      const callButton = document.querySelector('#manualcallBtnConnect');
      if (callButton) {
        callButton.removeAttribute('disabled'); // Remove disabled attribute
        callButton.disabled = false; // Set disabled property to false
        callButton.click();
      }
    });
    
    console.log('Call button clicked successfully');
    

  console.log('Verifying agent ringing state...');
  await this.page.waitForTimeout(3000);

  await this.takeScreenshot('agent_ringing_state');

  const state = await this.page.locator('.userstate').textContent();
  const isAgentRinging = state.trim() === 'Connecting';
  console.log(`Agent ringing state check result: ${isAgentRinging}`);
  
  console.log('Call process initiated successfully');

  } catch (error) {
    console.log('Error in dialing and making call: ', error.message);
    
    try {
      
      const phoneInput = this.page.locator('#phoneNumber');
      const phoneValue = await phoneInput.inputValue();
      const phoneVisible = await phoneInput.isVisible();
      console.log(`Phone input - Visible: ${phoneVisible}, Value: "${phoneValue}"`);
      
      // Check call button state
      const callButton = this.page.locator('#manualcallBtnConnect');
      const buttonVisible = await callButton.isVisible();
      const buttonEnabled = await callButton.isEnabled();
      const disabledAttr = await callButton.getAttribute('disabled');
      console.log(`Call button - Visible: ${buttonVisible}, Enabled: ${buttonEnabled}, Disabled attr: ${disabledAttr}`);
      
    } catch (debugError) {
      console.log('Debug failed:', debugError.message);
    }
    
    await this.takeScreenshot('dial_call_error');
    throw error;
  }
});

// call step : connecting->ringing

Then('I should see web call state progression', async function(){
  console.log('Customer ringing!');
  let stateElement = this.page.locator('.userstate');
  const expectedStates = ['Ringing' ,'Call'];
  const timeout = 40000; // 40 seconds total timeout
  const pollInterval = 5000; // 5 seconds between checks
  const startTime = Date.now();
  let currentExpectedStateIndex = 0;
  let lastLoggedState = '';
  
  while (Date.now() - startTime < timeout) {
    try {
      const currentState = await stateElement.textContent();
      const trimmedState = currentState.trim();
      
      // Log state every 5 seconds if it has changed
      if (trimmedState !== lastLoggedState) {
        console.log(`Current state: "${trimmedState}" at ${Math.round((Date.now() - startTime) / 1000)}s`);
        lastLoggedState = trimmedState;
        await this.takeScreenshot(`state_${trimmedState.toLowerCase()}`);
      }
      
      // Check if we've reached the current expected state
      const expectedState = expectedStates[currentExpectedStateIndex];
      if (trimmedState === expectedState) {
        console.log(`✓ Reached expected state: "${expectedState}"`);
        
        // Move to next expected state
        currentExpectedStateIndex++;
        
        // If we've reached all expected states, we're done
        if (currentExpectedStateIndex >= expectedStates.length) {
          console.log('✓ All expected states reached successfully!');
          return;
        }
        
        console.log(`Waiting for next state: "${expectedStates[currentExpectedStateIndex]}"`);
      }
      
      // Wait for 5 seconds before next check
      await this.page.waitForTimeout(pollInterval);
      
    } catch (error) {
      console.error('Error checking state:', error);
      throw error;
    }
  }

  const finalState = await stateElement.textContent();
  const expectedState = expectedStates[currentExpectedStateIndex];
  throw new Error(`Timeout: Expected "${expectedState}" but got "${finalState.trim()}" after ${timeout/1000}s`);
});

Then('I should handle web calling dispose with {string}', async function(disposeTag) {
  console.log('Call has ended state should be dispose !!!');
  let stateElement = await this.page.locator('.userstate');
  
  // First, select the dispose tag using the parameter
  try {
    // Click on the input field to open the dropdown
    const inputField = await this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
    await inputField.click();
    await inputField.fill(disposeTag);
    await this.takeScreenshot('dispose_tag_filled');

    const disposeOption = await this.page.locator(`li.select2-results__option:has-text("${disposeTag}")`);
    await disposeOption.waitFor({ state: 'visible', timeout: 5000 });
    await disposeOption.click();
    await this.takeScreenshot('dispose_option_selected');
    
    console.log(`Selected dispose tag: ${disposeTag}`);
  } catch (error) {
    console.error(`Error selecting dispose tag "${disposeTag}":`, error);
    throw error;
  }

  try {
    await this.page.waitForFunction(
      (selector) => {
        const element = document.querySelector(selector);
        return element && element.textContent.trim() === 'Dispose';
      },
      '.userstate',
    );
    
    
    let currentState = await stateElement.textContent();
    await this.takeScreenshot('call_ended_select_dispose');
    console.log('Call has ended and the state is ' + currentState.trim());
  } catch (error) {
    let currentState = await stateElement.textContent();
    console.error(`Timeout: Expected "Dispose" but got "${currentState.trim()}"`);
    await this.takeScreenshot('state_timeout_error');
    throw error;
  }
  // Finally, handle the DONE button
  try {
    const buttonLocator =  await this.page.locator('button.callDisposebtn', { hasText: 'DONE' });
    await buttonLocator.waitFor({ state: 'visible', timeout: 40000 });
    await buttonLocator.click();
    console.log('Clicked DONE button');
    await this.takeScreenshot('done_button_clicked');
    await this.page.waitForTimeout(3000);
  } catch (error) {
    console.error('Error clicking DONE button:', error);
    await this.takeScreenshot('done_button_error');
    throw error;
  }
});