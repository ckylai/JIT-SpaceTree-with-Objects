class ObjectCategory < ActiveRecord::Base
  has_many :known_objects

  # defines the JSON representation of the object category objects to be rendered in the JIT tree
  def as_json( options={} )
    { :id => id.to_s + "_objCat", :name => name, :data => description, :children => known_objects }
  end
end
