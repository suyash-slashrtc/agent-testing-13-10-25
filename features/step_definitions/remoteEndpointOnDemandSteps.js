// const { Given, When, Then } = require('@cucumber/cucumber');
// const { expect } = require('chai');


// When('I click on remote endpoint button',  async function () {
//     console.log('Clicking on remote endpoint button...');
//     await this.takeScreenshot('before_remote_endpoint_click');
//     try {
//       await this.page.waitForTimeout(6000);
//       await this.page.click('button.remotePhone');
//       await this.page.waitForTimeout(3000);
//       await this.takeScreenshot('after_remote_endpoint_click');
//     } catch (error) {
//       console.log('Error clicking remote endpoint:', error.message);
//       await this.takeScreenshot('remote_endpoint_error');
//     }
//     await this.page.waitForTimeout(3000);

// });


// Then('I should be in ready state-Remote', async function () {
//     console.log('Verifying ready state...');
//     // Store cookies and reuse them
    
//     const screenshotPath = await this.takeScreenshot(`is_ready_state?${this.currentAgent.username}`);
//     const isReady = await this.checkReadyState();
//     try {
//       expect(isReady).to.be.true;
//       console.log(`Ready state confirmed for ${this.currentAgent.username}`);
//       await this.page.waitForTimeout(4500);
//     }
//     catch(e){
//       console.log(`Agent  ${this.currentAgent.username} is not ready!`);
//     }
//     console.log(`Screenshot saved: ${screenshotPath}`);
//     // await this.page.waitForTimeout(4500);
//     await this.page.waitForTimeout(500);
// });

// When('I process all customers one by one', async function () {
//   for (let i = 0; i < this.customers.length; i++) {
//     const customer = this.getNextCustomer();
//     console.log(`Processing customer ${i + 1}: ${customer.username}`);
//   }
// });





// When('I dial number {string} and make the call Remote On Demand', async function (phoneNumber) {
//   const isReady = await this.checkReadyState();
//   if (!isReady) {
//       console.log('Agent is not ready!');
//       return;
//   }

//   await this.page.waitForTimeout(3000);
//   console.log(`Dialing number: ${phoneNumber} and making call...`);
//   await this.takeScreenshot('before_dialing_call');
  
//   try {
//       const cleanPhoneNumber = phoneNumber.replace(/"/g, '');
//       console.log(`Cleaned phone number: ${cleanPhoneNumber}`); 
      
//       // Wait for phone input
//       const phoneInput = this.page.locator('#phoneNumber');
//       await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
//       console.log('Found phone input field');
      
//       await phoneInput.clear();
//       await phoneInput.fill(cleanPhoneNumber);
      
//       const enteredValue = await phoneInput.inputValue();
//       console.log(`Entered phone number: "${enteredValue}"`);
//       await this.takeScreenshot('after_entering_number');
      
//       await this.page.waitForTimeout(2000);

//       // Click call button using a more reliable approach
//       const callButton = this.page.locator('#manualcallBtnConnect');
//       await callButton.waitFor({ state: 'visible', timeout: 10000 });
      
//       // Check if button is enabled
//       const isEnabled = await callButton.isEnabled();
//       console.log(`Call button enabled: ${isEnabled}`);
      
//       if (!isEnabled) {
//           // If disabled, try to enable it
//           await this.page.evaluate(() => {
//               const button = document.querySelector('#manualcallBtnConnect');
//               if (button) {
//                   button.disabled = false;
//                   button.style.pointerEvents = 'auto';
//               }
//           });
//           await this.page.waitForTimeout(1000);
//       }
      
//       await callButton.click();
//       console.log('Call button clicked successfully');
      
//       // Wait for initial state change
//       await this.page.waitForTimeout(5000);
      
//       const stateElement = this.page.locator('.userstate');
//       const initialState = await stateElement.textContent();
//       console.log(`Initial state after dialing: "${initialState.trim()}"`);
      
//       await this.takeScreenshot('after_dialing_call');

//   } catch (error) {
//       console.log('Error in dialing and making call: ', error.message);
//       await this.takeScreenshot('dial_call_error');
//       throw error;
//   }
// });

// Then('I should see call state progression and end call after {int} seconds', async function(timeoutSeconds){
//   console.log('Waiting for call state progression...');

//   const stateElement = this.page.locator('.userstate');
//   const disconnectButtonLocator = this.page.locator('button.callBtnDisconnect > i.fa-phone');

//   const expectedStates = ['Ringing', 'Call'];
//   const timeout = timeoutSeconds * 1000;
//   const pollInterval = 2000;
//   const startTime = Date.now();

//   let currentExpectedStateIndex = 0;
//   let lastLoggedState = '';
//   let callEnded = false;

//   console.log(`Monitoring call states for ${timeoutSeconds} seconds...`);
//   while (Date.now() - startTime < timeout) {
//     try {
//       const currentState = await stateElement.textContent();
//       const trimmedState = currentState.trim();
      
//       // Log state if it has changed
//       if (trimmedState !== lastLoggedState) {
//         console.log(`Current state: "${trimmedState}" at ${Math.round((Date.now() - startTime) / 1000)}s`);
//         lastLoggedState = trimmedState;
//         await this.takeScreenshot(`state_${trimmedState.toLowerCase().replace(/\s+/g, '_')}`);
//       }
      
//       // Check if we've reached the current expected state
//       if (currentExpectedStateIndex < expectedStates.length) {
//         const expectedState = expectedStates[currentExpectedStateIndex];
        
//         if (trimmedState === expectedState) {
//           console.log(`✓ Reached expected state: "${expectedState}"`);
          
//           // If state is "Call", end the call immediately using disconnect button
//           if (trimmedState === 'Call' && !callEnded) {
//             console.log('Call state detected. Ending call now using disconnect button...');
//             await this.page.waitForTimeout(1000);
            
//             // Wait a brief moment for call to stabilize
            
//             // Multiple strategies to find and click the DISCONNECT button
//             let buttonClicked = false;
            
//             // Strategy 1: Try the specific disconnect button locator
//             if (await disconnectButtonLocator.isVisible({ timeout: 5000 })) {
//               await this.page.waitForTimeout( 37 * 1000);
//               await disconnectButtonLocator.click();
//               console.log('✓ Call ended using .callBtnDisconnect button');
//               buttonClicked = true;
//             } 
//             // Strategy 2: Try alternative disconnect button selectors
//             else {
//               const alternativeDisconnectButtons = [
//                 '.callBtnDisconnect',
//                 '[class*="disconnect"]',
//                 'button[onclick*="disconnect"]',
//                 'button[title*="disconnect" i]',
//                 'button[title*="end call" i]',
//                 'button:has-text("Disconnect")',
//                 'button:has-text("End Call")'
//               ];
              
//               for (const selector of alternativeDisconnectButtons) {
//                 const altButton = this.page.locator(selector);
//                 if (await altButton.isVisible({ timeout: 1000 })) {
//                   await altButton.click();
//                   console.log(`✓ Call ended using alternative disconnect selector: ${selector}`);
//                   buttonClicked = true;
//                   break;
//                 }
//               }
//             }
            
//             // Strategy 3: Use JavaScript click as fallback for disconnect button
//             if (!buttonClicked) {
//               console.log('Trying JavaScript click for disconnect button...');
//               const jsResult = await this.page.evaluate(() => {
//                 const buttons = Array.from(document.querySelectorAll('button'));
//                 const disconnectButton = buttons.find(btn => 
//                   btn.className?.includes('callBtnDisconnect') ||
//                   btn.className?.toLowerCase().includes('disconnect') ||
//                   btn.textContent?.toLowerCase().includes('disconnect') ||
//                   btn.textContent?.toLowerCase().includes('end call') ||
//                   btn.title?.toLowerCase().includes('disconnect') ||
//                   btn.title?.toLowerCase().includes('end call')
//                 );
//                 if (disconnectButton) {
//                   disconnectButton.click();
//                   return true;
//                 }
//                 return false;
//               });
              
//               if (jsResult) {
//                 console.log('✓ Call ended using JavaScript click on disconnect button');
//                 buttonClicked = true;
//               }
//             }
            
//             if (buttonClicked) {
//               callEnded = true;
//               await this.takeScreenshot('call_disconnected_success');
              
//               // Wait for state to change after ending call
//               await this.page.waitForTimeout(3000);
//               const finalState = await stateElement.textContent();
//               console.log(`State after disconnecting call: "${finalState.trim()}"`);
              
//               // Break out of the loop since call is ended
//               break;
//             } else {
//               console.log('❌ Could not find or click disconnect button');
//               // Take screenshot to debug what buttons are available
//               await this.takeScreenshot('disconnect_button_not_found');
//             }
//           }
          
//           currentExpectedStateIndex++;
//         }
//       }

//       // If call already ended, break the loop
//       if (callEnded) {
//         console.log('Call ended successfully, exiting state monitoring');
//         break;
//       }
      
//       // Wait before next check
//       await this.page.waitForTimeout(pollInterval);   
      
//     } catch (error) {
//       console.error('Error during state monitoring:', error.message);
//       // Continue monitoring despite errors
//     }
//   }

//   // Final state check and cleanup
//   const finalState = await stateElement.textContent();
//   console.log(`Final call state: "${finalState.trim()}"`);

//   // If call wasn't ended but we're in Call state, try one more time
//   if (!callEnded && finalState.trim() === 'Call') {
//     console.log('Attempting final call disconnect...');
//     try {
//       await disconnectButtonLocator.click({ timeout: 5000 });
//       console.log('✓ Call ended in final attempt');
//       callEnded = true;
//       await this.page.waitForTimeout(3000);
//     } catch (finalError) {
//       console.log('❌ Final disconnect attempt failed:', finalError.message);
//     }
//   }

//   if (!callEnded) {
//     console.log(`⚠️ Call monitoring completed without ending call. Final state: "${finalState.trim()}"`);
//     throw new Error(`Call was not disconnected after ${timeoutSeconds} seconds. Final state: "${finalState.trim()}"`);
//   }

//   await this.takeScreenshot('call_disconnect_completed');
//   });

// Then('I should handle dispose with {string}', async function(disposeTag) {
// console.log('Handling disposition after call disconnect...');

// // Wait a bit for the dispose UI to appear after disconnect
// await this.page.waitForTimeout(5000);

// let stateElement = this.page.locator('.userstate');
// const currentState = await stateElement.textContent();
// console.log(`Current state before dispose: "${currentState.trim()}"`);

// try {  
//   // Wait for and fill the disposition input
//   const inputField = this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
//   await inputField.waitFor({ state: 'visible', timeout: 15000 });
//   await inputField.click();
//   await inputField.fill(disposeTag);
//   await this.takeScreenshot('dispose_tag_filled');

//   // Select the disposition option
//   const disposeOption = this.page.locator(`li.select2-results__option:has-text("${disposeTag}")`);
//   await disposeOption.waitFor({ state: 'visible', timeout: 10000 });
//   await disposeOption.click();
//   await this.takeScreenshot('dispose_option_selected');
  
//   console.log(`Selected dispose tag: ${disposeTag}`);
  
//   // Wait for state to potentially change or for the dispose to be recorded
//   await this.page.waitForTimeout(3000);
  
//   const newState = await stateElement.textContent();
//   await this.takeScreenshot('dispose_state_confirmed');
//   console.log('Disposition handled. Current state: ' + newState.trim());
  
// } catch (error) {
//   console.error(`Error handling disposition "${disposeTag}":`, error.message);
//   await this.takeScreenshot('dispose_error');
//   throw error;
// }

// // Handle the final DONE button (separate from disconnect button)
// try {
//   const doneButtonLocator = this.page.locator('button.callDisposebtn', { hasText: 'DONE' });
//   await doneButtonLocator.waitFor({ state: 'visible', timeout: 15000 });
//   await doneButtonLocator.click();
//   console.log('Clicked final DONE button after disposition');
//   await this.takeScreenshot('final_done_clicked');
  
//   // Wait for state to reset
//   await this.page.waitForTimeout(5000);
//   const finalState = await stateElement.textContent();
//   console.log(`Final state after complete flow: "${finalState.trim()}"`);
  
// } catch (error) {
//   console.error('Error clicking final DONE button:', error.message);
//   await this.takeScreenshot('final_done_error');
//   // Don't throw error here as the main call flow is complete
//   console.log('Continuing despite DONE button error...');
// }
// });

// // Additional debug step to identify all buttons
// Then('I debug all call related buttons', async function() {
// console.log('Debugging all call-related buttons...');

// const buttons = await this.page.$$eval('button', buttons => 
//   buttons.map(btn => ({
//     text: btn.textContent?.trim(),
//     classes: btn.className,
//     id: btn.id,
//     disabled: btn.disabled,
//     visible: btn.offsetParent !== null,
//     title: btn.title || 'No title'
//   }))
// );

// console.log('All buttons on page:', JSON.stringify(buttons, null, 2));

// // Filter for call-related buttons
// const callButtons = buttons.filter(btn => 
//   btn.classes?.toLowerCase().includes('call') ||
//   btn.classes?.toLowerCase().includes('disconnect') ||
//   btn.classes?.toLowerCase().includes('dispose') ||
//   btn.text?.toLowerCase().includes('call') ||
//   btn.text?.toLowerCase().includes('disconnect') ||
//   btn.text?.toLowerCase().includes('dispose') ||
//   btn.text?.toLowerCase().includes('done') ||
//   btn.text?.toLowerCase().includes('end')
// );

// console.log('Call-related buttons:', JSON.stringify(callButtons, null, 2));

// // Specifically check for .callBtnDisconnect
// const disconnectButtons = buttons.filter(btn => 
//   btn.classes?.includes('callBtnDisconnect')
// );

// console.log('Disconnect buttons (.callBtnDisconnect):', JSON.stringify(disconnectButtons, null, 2));
// });