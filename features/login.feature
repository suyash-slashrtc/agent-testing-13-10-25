Feature: Agent Login, Ready State Verification, and Manual Calling

  Scenario Outline: Multiple agents login, go ready, and make manual calls
    Given I have loaded agents from CSV
    And I am on the login page for agent from row <row>
    When I login with credentials from CSV row <row>
    Then I should be redirected to the dashboard
    # When I click on remote endpoint button
    # When I click on the web endpoint button        
    # And I handle microphone permission popup    
    # Then I should be in ready state-Remote
    # Manual calling flow - directly enter number and call
    # When I dial number <9167603956> and make the call
    # Then I should see call connecting state
    

    Examples:
      | row | phoneNumber  | disposeTag |
      | 0   | 9167603956   | Test Call  |
      | 1   | 9137272180   | Test Call  |