Feature: Remote endpoint calling with multiple agents

  Scenario Outline: Multiple agents processing customers via Remote Endpoint
    Given I am on the login page for agent from row <row>
    When I login with credentials from CSV row <row>
    Then I should be redirected to the dashboard
    
    # Given I am on the login page for all agents
    # When I login with credentials for all agents
    # Then I should be redirected to the dashboard for all agents
    When I click on remote endpoint button
    Then I should be in ready state-Remote
    # When I process all customers one by one
    When I dial 1st number and make the call Remote On Demand
    Then I am logging out

    Examples:
      | row |
      | 0   |
      | 1   |
      | 2   |
      | 3   |