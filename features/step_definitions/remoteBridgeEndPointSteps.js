const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");
const { stat } = require("fs-extra");

// My code 
// Then("I Handle auto calls", async function () {
//   const disposeTag = "TestCall";

//   const getLiveState = async () => {
//     const stateElement = await this.page.locator(".userstate");
//     const stateText = await stateElement.textContent();
//     const trimmedState = stateText.trim().toLowerCase();
//     return trimmedState;
//   };
//   await this.page.waitForTimeout(6000);
//   let state = await getLiveState();

//   while (state == "ready") {
//     state = await getLiveState();
//     console.log("Currently on " + state + " State");

//     while (state != "call") {
//       state = await getLiveState();
//       console.log(state);
//       console.log("inside state != 'call' =============================");
//     }

//     if (state == "call") {
//       console.log(state);
//       await this.page.waitForTimeout(5000);
//       const callDisconnectButton = await this.page.locator(
//         "button.callBtnDisconnect > i.fa-phone"
//       );
//       callDisconnectButton.click();
//     }

//     try {
//       await this.page.waitForTimeout(3000);
//       const inputField = this.page.locator(
//         'input.select2-search__field[placeholder="Select Disposition"]'
//       );
//       await inputField.click();
//       await inputField.fill(disposeTag);
//       await this.takeScreenshot("dispose_tag_filled");

//       const disposeOption = this.page.locator(
//         `li.select2-results__option:has-text("${disposeTag}")`
//       );
//       await disposeOption.waitFor({ state: "visible", timeout: 5000 });
//       await disposeOption.click();
//       await this.takeScreenshot("dispose_option_selected");

//       console.log(`Selected dispose tag: ${disposeTag}`);

//       console.log("--------------------------------");
//     } catch (error) {
//       console.error(`Error selecting dispose tag "${disposeTag}":`, error);
//       throw error;
//     }

//     try {
//       await this.page.waitForFunction(
//         (selector) => {
//           const element = document.querySelector(selector);
//           return element && element.textContent.trim() === "Dispose";
//         },
//         ".userstate",
//         { timeout: 100000 }
//       );

//       let currentState = await getLiveState();
//       await this.takeScreenshot("call_ended_select_dispose");
//       console.log("Call has ended and the state is " + currentState.trim());
//       // let state = await getLiveState();
//       console.log("Call has ended and the state is " + state);
//     } catch (error) {
//       let currentState = await stateElement.textContent();
//       console.error(
//         `Timeout: Expected "Dispose" but got "${currentState.trim()}"`
//       );
//       await this.takeScreenshot("state_timeout_error");
//       throw error;
//     }

//     // cancel buton selection

//     // Finally, handle the DONE button
//     try {
//       const buttonLocator = this.page.locator("button.callDisposebtn", {
//         hasText: "DONE",
//       });
//       await buttonLocator.waitFor({ state: "visible", timeout: 40000 });
//       await buttonLocator.click();
//       console.log("Clicked DONE button");
//       await this.takeScreenshot("done_button_clicked");
//       await this.page.waitForTimeout(3000);
//     } catch (error) {
//       console.error("Error clicking DONE button:", error);
//       await this.takeScreenshot("done_button_error");
//       throw error;
//     }
//     await this.page.waitForTimeout(3000);
//     state = await getLiveState();
//   }
// });


Then("I Handle auto calls", async function () {
    const disposeTag = "TestCall";
    
    const getLiveState = async () => {
      const stateElement = await this.page.locator(".userstate");
      const stateText = await stateElement.textContent();
      return stateText.trim().toLowerCase();
    };
  
    const selectDisposition = async () => {
      await this.page.waitForTimeout(3000);
      const inputField = this.page.locator('input.select2-search__field[placeholder="Select Disposition"]');
      await inputField.click();
      await inputField.fill(disposeTag);
      // await this.takeScreenshot("dispose_tag_filled");
  
      const disposeOption = this.page.locator(`li.select2-results__option:has-text("${disposeTag}")`);
      await disposeOption.waitFor({ state: "visible", timeout: 5000 });
      await disposeOption.click();
  
      await this.page.waitForTimeout(3000);
      // await this.takeScreenshot("dispose_option_selected");
      console.log(`Selected dispose tag: ${disposeTag}`);
    };
  
    const clickDoneButton = async () => {

      const buttonLocator = this.page.locator("button.callDisposebtn", { hasText: "DONE" });
      await buttonLocator.waitFor({ state: "visible", timeout: 5000 });
      await buttonLocator.click();
      console.log("Clicked DONE button");
      // await this.takeScreenshot("done_button_clicked");
    };
  
    const waitForDisposeState = async () => {
      await this.page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && element.textContent.trim() === "Dispose";
        },
        ".userstate",
        { timeout: 100000 }
      );
    };
  
    // Initial wait and state check
    await this.page.waitForTimeout(6000);
    let state = await getLiveState();
  
    while (state === "ready") {
      console.log("Currently on " + state + " State");
  
      // Wait for call state
      while (state !== "call") {
        state = await getLiveState();
        console.log("Waiting for call state, current state:", state);
      }
  
      // Handle call state
      if (state === "call") {
        console.log("Call detected, disconnecting...");
        await this.page.waitForTimeout(2000);
        const callDisconnectButton = this.page.locator("button.callBtnDisconnect > i.fa-phone");
        await callDisconnectButton.click();
      }
      
      // Handle disposition
      try {
        await this.page.waitForTimeout(5000);
        await selectDisposition();
        await this.page.waitForTimeout(3000);    
        await waitForDisposeState();

        const currentState = await getLiveState();
        // await this.takeScreenshot("call_ended_select_dispose");
        console.log("Call has ended and the state is " + currentState);
      } catch (error) {
        const currentState = await getLiveState();
        console.error(`Timeout: Expected "Dispose" but got "${currentState}"`);
        
        throw error;
      }
  
      // Handle DONE button
      try {
        await this.page.waitForTimeout(6000);
        await clickDoneButton();
        await this.page.waitForTimeout(2000);
      } catch (error) {
        console.error("Error clicking DONE button:", error);
        // await this.takeScreenshot("done_button_error");
        throw error;
      }
  
      // Update state for next iteration
      state = await getLiveState();
      console.log("State after completing cycle:", state);



      while(state != 'ready'){
        if(state == 'dispose'){
          await selectDisposition();
          await clickDoneButton();
          this.page.waitForTimeout(3000);
        }
        state = await getLiveState();
      }

    }
  });