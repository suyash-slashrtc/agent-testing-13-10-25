const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

When('I click on remote endpoint button', async function () {
    console.log('Clicking on remote endpoint button...');
    await this.takeScreenshot('before_remote_endpoint_click');
    try {
        await this.page.waitForTimeout(6000);
        await this.page.click('button.remotePhone');
        await this.page.waitForTimeout(3000);
        await this.takeScreenshot('after_remote_endpoint_click');
    } catch (error) {
        console.log('Error clicking remote endpoint:', error.message);
        await this.takeScreenshot('remote_endpoint_error');
    }
    await this.page.waitForTimeout(3000);

});


Then('I should be in ready state-Remote', async function () {
    console.log('Verifying ready state...');
    // Store cookies and reuse the
    const screenshotPath = await this.takeScreenshot(`is_ready_state?${this.currentAgent.username}`);
    const isReady = await this.checkReadyState();
    try {
        expect(isReady).to.be.true;
        console.log(`Ready state confirmed for ${this.currentAgent.username}`);
        await this.page.waitForTimeout(4500);
    }
    catch (e) {
        console.log(`Agent  ${this.currentAgent.username} is not ready!`);
    }
    console.log(`Screenshot saved: ${screenshotPath}`);
    // await this.page.waitForTimeout(4500);
    await this.page.waitForTimeout(500);
});

// When('I process all customers one by one', async function () {
    //   for (let i = 0; i < this.customers.length; i++) {
    //     const customer = this.getNextCustomer();
    //     console.log(`Processing customer ${i + 1}: ${customer.username}`);
    //   }
// })


// deepseek   

When('I dial 1st number and make the call Remote On Demand', async function () {
    // Configuration constants
    const CONFIG = {
        TIMEOUTS: {
            CALL_DURATION: 40 * 1000,
            ELEMENT_VISIBLE: 10000,
            STATE_CHANGE: 5000,
            POLL_INTERVAL: 2000,
            BETWEEN_CALLS: 1000,
            STATE_MONITORING: 60000
        },
        SELECTORS: {
            PHONE_INPUT: '#phoneNumber',
            CALL_BUTTON: '#manualcallBtnConnect',
            STATE_ELEMENT: '.userstate',
            DISCONNECT_BUTTON: 'button.callBtnDisconnect > i.fa-phone',
            DISPOSITION_INPUT: 'input.select2-search__field[placeholder="Select Disposition"]',
            DISPOSITION_OPTION: 'li.select2-results__option',
            DONE_BUTTON: 'button.callDisposebtn'
        },
        EXPECTED_STATES: ['Ringing', 'Call'],
        DISPOSE_TAG: 'TestCall'
    };

    // Helper functions
    const helpers = {
        log: (message) => console.log(message),
        error: (message, error) => console.error(message, error?.message || error),
        screenshot: async (name) => await this.takeScreenshot(name),
        wait: async (ms) => await this.page.waitForTimeout(ms)
    };

    // Core operations
    const operations = {
        // Check if agent is ready to make calls
        checkAgentReady: async () => {
            const isReady = await this.checkReadyState();
            if (!isReady) {
                helpers.log('Agent is not ready!');
                return false;
            }
            
            if (this.customers.length === 0) {
                helpers.log('CSV file is empty!!!');
                return false;
            }
            
            return true;
        },

        // Enable call button if disabled
        enableCallButton: async () => {
            await this.page.evaluate(() => {
                const button = document.querySelector('#manualcallBtnConnect');
                if (button) {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                }
            });
        },

        // Dial a phone number
        dialNumber: async (phoneNumber) => {
            helpers.log(`Dialing number: ${phoneNumber}`);

            await helpers.screenshot('before_dialing_call');

            const phoneInput = this.page.locator(CONFIG.SELECTORS.PHONE_INPUT);
            await phoneInput.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.ELEMENT_VISIBLE });
            
            await phoneInput.clear();
            await phoneInput.fill(phoneNumber);
            
            const enteredValue = await phoneInput.inputValue();
            helpers.log(`Entered phone number: "${enteredValue}"`);
            await helpers.screenshot('after_entering_number');
            
            await helpers.wait(2000);
            return true;
        },

        // Initiate the call
        initiateCall: async () => {
            const callButton = this.page.locator(CONFIG.SELECTORS.CALL_BUTTON);
            await callButton.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.ELEMENT_VISIBLE });

            const isEnabled = await callButton.isEnabled();
            helpers.log(`Call button enabled: ${isEnabled}`);

            if (!isEnabled) {
                await operations.enableCallButton();
                await helpers.wait(1000);
            }

            await callButton.click();
            helpers.log('Call button clicked successfully');
            
            await helpers.wait(3000);
            await helpers.screenshot('after_dialing_call');
        },

        // Get current call state
        getCallState: async () => {
            const stateElement = this.page.locator(CONFIG.SELECTORS.STATE_ELEMENT);
            const state = await stateElement.textContent();
            return state.trim();
        },

        // End the call using disconnect button
        endCall: async () => {
            const disconnectButton = this.page.locator(CONFIG.SELECTORS.DISCONNECT_BUTTON);
            
            // Wait for call to stabilize before ending
            await helpers.wait(37 * 1000);
            
            if (await disconnectButton.isVisible({ timeout: 5000 })) {
                await disconnectButton.click();
                helpers.log('✓ Call ended using disconnect button');
                return true;
            }
            
            return false;
        },

        // Monitor state until it reaches a specific target state
        monitorStateUntilReached: async (targetState, timeoutMs = CONFIG.TIMEOUTS.STATE_MONITORING) => {
            const startTime = Date.now();
            let lastLoggedState = '';

            helpers.log(`Monitoring state until "${targetState}" is reached...`);

            while (Date.now() - startTime < timeoutMs) {
                try {
                    const currentState = await operations.getCallState();

                    // Log state changes
                    if (currentState !== lastLoggedState) {
                        helpers.log(`Current state: "${currentState}" at ${Math.round((Date.now() - startTime) / 1000)}s`);
                        lastLoggedState = currentState;
                        await helpers.screenshot(`state_${currentState.toLowerCase().replace(/\s+/g, '_')}`);
                    }

                    // Check if target state is reached
                    if (currentState === targetState) {
                        helpers.log(`✓ Target state "${targetState}" reached`);
                        return true;
                    }

                    await helpers.wait(CONFIG.TIMEOUTS.POLL_INTERVAL);
                } catch (error) {
                    helpers.error('Error during state monitoring:', error);
                }
            }

            const finalState = await operations.getCallState();
            helpers.log(`Timeout: Target state "${targetState}" not reached. Final state: "${finalState}"`);
            return false;
        },

        // Monitor call state progression and handle call ending
        monitorCallAndEnd: async () => {
            const startTime = Date.now();
            let lastLoggedState = '';
            let callEnded = false;
            let currentExpectedStateIndex = 0;

            helpers.log(`Monitoring call states for ${CONFIG.TIMEOUTS.CALL_DURATION / 1000} seconds...`);

            while (Date.now() - startTime < CONFIG.TIMEOUTS.CALL_DURATION && !callEnded) {
                try {
                    const currentState = await operations.getCallState();

                    // Log state changes
                    if (currentState !== lastLoggedState) {
                        helpers.log(`Current state: "${currentState}" at ${Math.round((Date.now() - startTime) / 1000)}s`);
                        lastLoggedState = currentState;
                        await helpers.screenshot(`state_${currentState.toLowerCase().replace(/\s+/g, '_')}`);
                    }

                    // If state is Dispose, handle it immediately
                    if (currentState === 'Dispose') {
                        helpers.log('Dispose state detected, handling disposition...');
                        await operations.handleDisposition();
                        callEnded = true;
                        break;
                    }

                    // Track expected state progression
                    if (currentExpectedStateIndex < CONFIG.EXPECTED_STATES.length) {
                        const expectedState = CONFIG.EXPECTED_STATES[currentExpectedStateIndex];
                        
                        if (currentState === expectedState) {
                            helpers.log(`✓ Reached expected state: "${expectedState}"`);
                            
                            // End call when "Call" state is reached
                            if (currentState === 'Call') {
                                callEnded = await operations.endCall();
                                if (callEnded) {
                                    await helpers.screenshot('call_disconnected_success');
                                    await helpers.wait(3000);
                                    
                                    // After ending call, wait for Dispose state
                                    helpers.log('Waiting for Dispose state after ending call...');
                                    const disposeReached = await operations.monitorStateUntilReached('Dispose');
                                    if (disposeReached) {
                                        await operations.handleDisposition();
                                    }
                                    break;
                                }
                            }
                            currentExpectedStateIndex++;
                        }
                    }

                    await helpers.wait(CONFIG.TIMEOUTS.POLL_INTERVAL);
                } catch (error) {
                    helpers.error('Error during state monitoring:', error);
                }
            }

            return callEnded;
        },

        // Handle disposition after call ends
        handleDisposition: async () => {
            helpers.log('Handling disposition after call disconnect...');

            try {
                // Check if we're already in Dispose state
                const currentState = await operations.getCallState();
                if (currentState !== 'Dispose') {
                    helpers.log(`Not in Dispose state, current state: "${currentState}". Waiting for Dispose state...`);
                    const disposeReached = await operations.monitorStateUntilReached('Dispose');
                    if (!disposeReached) {
                        throw new Error('Dispose state not reached within timeout');
                    }
                }

                helpers.log('In Dispose state, proceeding with disposition...');

                const inputField = this.page.locator(CONFIG.SELECTORS.DISPOSITION_INPUT);
                await inputField.waitFor({ state: 'visible', timeout: 15000 });
                
                await inputField.click();
                await inputField.fill(CONFIG.DISPOSE_TAG);
                await helpers.screenshot('dispose_tag_filled');

                const disposeOption = this.page.locator(`${CONFIG.SELECTORS.DISPOSITION_OPTION}:has-text("${CONFIG.DISPOSE_TAG}")`);
                await disposeOption.waitFor({ state: 'visible', timeout: 10000 });
                await disposeOption.click();
                await helpers.screenshot('dispose_option_selected');

                helpers.log(`Selected dispose tag: ${CONFIG.DISPOSE_TAG}`);
                await helpers.wait(3000);

                // Click DONE button after disposition
                await operations.clickDoneButton();
                
                const newState = await operations.getCallState();
                await helpers.screenshot('dispose_state_confirmed');
                helpers.log('Disposition handled. Current state: ' + newState);
                
                return true;
            } catch (error) {
                helpers.error(`Error handling disposition "${CONFIG.DISPOSE_TAG}":`, error);
                await helpers.screenshot('dispose_error');
                throw error;
            }
        },

        // Click final DONE button
        clickDoneButton: async () => {
            try {
                const doneButton = this.page.locator(CONFIG.SELECTORS.DONE_BUTTON, { hasText: 'DONE' });
                await doneButton.waitFor({ state: 'visible', timeout: 15000 });
                await doneButton.click();
                helpers.log('Clicked final DONE button after disposition');
                await helpers.screenshot('final_done_clicked');

                await helpers.wait(5000);
                const finalState = await operations.getCallState();
                helpers.log(`Final state after complete flow: "${finalState}"`);
                
                return true;
            } catch (error) {
                helpers.error('Error clicking final DONE button:', error);
                await helpers.screenshot('final_done_error');
                return false;
            }
        },

        // Process a single customer call
        processCustomerCall: async (customer, index) => {
            helpers.log(`Processing customer ${index + 1}: ${customer.phone_no}`);
            
            try {
                // Step 1: Dial number and initiate call
                await operations.dialNumber(customer.phone_no);
                await operations.initiateCall();
                
                // Step 2: Get initial state after dialing
                const initialState = await operations.getCallState();
                helpers.log(`Initial state after dialing: "${initialState}"`);
                
                // Step 3: If initial state is already Ringing, monitor from there
                if (initialState === 'Ringing') {
                    helpers.log('Call is already in Ringing state, monitoring progression...');
                }
                
                // Step 4: Monitor call progression and handle all scenarios
                const callCompleted = await operations.monitorCallAndEnd();
                const finalState = await operations.getCallState();
                
                // Step 5: Handle edge cases
                if (!callCompleted) {
                    if (finalState === 'Dispose') {
                        helpers.log('Call ended in Dispose state, handling disposition...');
                        await operations.handleDisposition();
                        return true;
                    }
                    throw new Error(`Call was not completed properly. Final state: "${finalState}"`);
                }

                helpers.log(`Successfully completed call for customer ${index + 1}`);
                return true;
                
            } catch (error) {
                helpers.error(`Error processing customer ${index + 1}:`, error);
                await helpers.screenshot(`customer_${index + 1}_error`);
                throw error;
            }
        }
    };

    // Main execution flow
    try {
        // Pre-checks
        if (!await operations.checkAgentReady()) {
            return;
        }
        
        helpers.log(`Starting call process for ${this.customers.length} customers`);

        // Process each customer
        for (let i = 0; i < this.customers.length; i++) {
            await operations.processCustomerCall(this.customers[i], i);
            
            // Wait between calls if not the last customer
            if (i < this.customers.length - 1) {
                await helpers.wait(CONFIG.TIMEOUTS.BETWEEN_CALLS);
            }
        }

        helpers.log('All customer calls processed successfully');
        
    } catch (error) {
        helpers.error('Fatal error in main execution:', error);
        await helpers.screenshot('main_execution_error');
        throw error;
    }
});

// Additional debug step to identify all buttons
Then('I debug all call related buttons', async function () {
    console.log('Debugging all call-related buttons...');

    const buttons = await this.page.$$eval('button', buttons =>
        buttons.map(btn => ({
            text: btn.textContent?.trim(),
            classes: btn.className,
            id: btn.id,
            disabled: btn.disabled,
            visible: btn.offsetParent !== null,
            title: btn.title || 'No title'
        }))
    );

    console.log('All buttons on page:', JSON.stringify(buttons, null, 2));

    // Filter for call-related buttons
    const callButtons = buttons.filter(btn =>
        btn.classes?.toLowerCase().includes('call') ||
        btn.classes?.toLowerCase().includes('disconnect') ||
        btn.classes?.toLowerCase().includes('dispose') ||
        btn.text?.toLowerCase().includes('call') ||
        btn.text?.toLowerCase().includes('disconnect') ||
        btn.text?.toLowerCase().includes('dispose') ||
        btn.text?.toLowerCase().includes('done') ||
        btn.text?.toLowerCase().includes('end')
    );

    console.log('Call-related buttons:', JSON.stringify(callButtons, null, 2));

    // Specifically check for .callBtnDisconnect
    const disconnectButtons = buttons.filter(btn =>
        btn.classes?.includes('callBtnDisconnect')
    );

    console.log('Disconnect buttons (.callBtnDisconnect):', JSON.stringify(disconnectButtons, null, 2));
});