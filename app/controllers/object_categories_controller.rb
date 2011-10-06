class ObjectCategoriesController < ApplicationController
  # GET /object_categories
  # GET /object_categories.json
  def index
    @object_categories = ObjectCategory.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @object_categories }
    end
  end

  # GET /object_categories/1
  # GET /object_categories/1.json
  def show
    @object_category = ObjectCategory.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @object_category }
    end
  end

  # GET /object_categories/new
  # GET /object_categories/new.json
  def new
    @object_category = ObjectCategory.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @object_category }
    end
  end

  # GET /object_categories/1/edit
  def edit
    @object_category = ObjectCategory.find(params[:id])
  end

  # POST /object_categories
  # POST /object_categories.json
  def create
    @object_category = ObjectCategory.new(params[:object_category])

    respond_to do |format|
      if @object_category.save
        format.html { redirect_to @object_category, notice: 'Object category was successfully created.' }
        format.json { render json: @object_category, status: :created, location: @object_category }
      else
        format.html { render action: "new" }
        format.json { render json: @object_category.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /object_categories/1
  # PUT /object_categories/1.json
  def update
    @object_category = ObjectCategory.find(params[:id])

    respond_to do |format|
      if @object_category.update_attributes(params[:object_category])
        format.html { redirect_to @object_category, notice: 'Object category was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @object_category.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /object_categories/1
  # DELETE /object_categories/1.json
  def destroy
    @object_category = ObjectCategory.find(params[:id])
    @object_category.destroy

    respond_to do |format|
      format.html { redirect_to object_categories_url }
      format.json { head :ok }
    end
  end
end
