require 'test_helper'

class KnownObjectsControllerTest < ActionController::TestCase
  setup do
    @known_object = known_objects(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:known_objects)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create known_object" do
    assert_difference('KnownObject.count') do
      post :create, known_object: @known_object.attributes
    end

    assert_redirected_to known_object_path(assigns(:known_object))
  end

  test "should show known_object" do
    get :show, id: @known_object.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @known_object.to_param
    assert_response :success
  end

  test "should update known_object" do
    put :update, id: @known_object.to_param, known_object: @known_object.attributes
    assert_redirected_to known_object_path(assigns(:known_object))
  end

  test "should destroy known_object" do
    assert_difference('KnownObject.count', -1) do
      delete :destroy, id: @known_object.to_param
    end

    assert_redirected_to known_objects_path
  end
end
