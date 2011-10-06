require 'test_helper'

class ObjectCategoriesControllerTest < ActionController::TestCase
  setup do
    @object_category = object_categories(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:object_categories)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create object_category" do
    assert_difference('ObjectCategory.count') do
      post :create, object_category: @object_category.attributes
    end

    assert_redirected_to object_category_path(assigns(:object_category))
  end

  test "should show object_category" do
    get :show, id: @object_category.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @object_category.to_param
    assert_response :success
  end

  test "should update object_category" do
    put :update, id: @object_category.to_param, object_category: @object_category.attributes
    assert_redirected_to object_category_path(assigns(:object_category))
  end

  test "should destroy object_category" do
    assert_difference('ObjectCategory.count', -1) do
      delete :destroy, id: @object_category.to_param
    end

    assert_redirected_to object_categories_path
  end
end
