class KnownObjectsController < ApplicationController
  # GET /known_objects
  # GET /known_objects.json
  def index
    @known_objects = KnownObject.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @known_objects }
    end
  end

  # GET /known_objects/1
  # GET /known_objects/1.json
  def show
    @known_object = KnownObject.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @known_object }
    end
  end

  # GET /known_objects/new
  # GET /known_objects/new.json
  def new
    @known_object = KnownObject.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @known_object }
    end
  end

  # GET /known_objects/1/edit
  def edit
    @known_object = KnownObject.find(params[:id])
  end

  # POST /known_objects
  # POST /known_objects.json
  def create
    @known_object = KnownObject.new(params[:known_object])

    respond_to do |format|
      if @known_object.save
        format.html { redirect_to @known_object, notice: 'Known object was successfully created.' }
        format.json { render json: @known_object, status: :created, location: @known_object }
      else
        format.html { render action: "new" }
        format.json { render json: @known_object.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /known_objects/1
  # PUT /known_objects/1.json
  def update
    @known_object = KnownObject.find(params[:id])

    respond_to do |format|
      if @known_object.update_attributes(params[:known_object])
        format.html { redirect_to @known_object, notice: 'Known object was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @known_object.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /known_objects/1
  # DELETE /known_objects/1.json
  def destroy
    @known_object = KnownObject.find(params[:id])
    @known_object.destroy

    respond_to do |format|
      format.html { redirect_to known_objects_url }
      format.json { head :ok }
    end
  end
end
