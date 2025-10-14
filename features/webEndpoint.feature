Feature: Web end-point calling with multiple agents

  Scenario Outline: Multiple agents calling via Web Endpoint
    Given I am on the login page for agent from row <row>
    When I login with credentials from CSV row <row>
    Then I should be redirected to the dashboard
    When I click on the web endpoint button
    And I handle microphone permission popup
    Then I should be in ready state-web
    When I dial number "<phoneNumber>" and make the call
    Then I should see web call state progression
    Then I should handle web calling dispose with "<disposeTag>"
    Then I am logging out

    Examples:
      | row | phoneNumber | disposeTag |
      | 0   | 9619264110  | TestCall   |
      | 1   | 8692003560  | TestCall   |
      | 2   | 9167603956  | TestCall   |