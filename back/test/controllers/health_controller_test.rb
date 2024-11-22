require "test_helper"

class HealthControllerTest < ActionDispatch::IntegrationTest
  test "should get check" do
    get health_check_url
    assert_response :success
  end
end
