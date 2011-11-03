class ObjectCategory < ActiveRecord::Base
  # ensure the soft-deleted children (where deleted is false in its table) are not shown
  has_many :known_objects, :conditions => {:deleted => false}

  # defines the JSON representation of the object category objects to be rendered in the JIT tree
  def as_json( options={} )
    { :id => id.to_s + "_cat", :name => name, :data => description, :children => known_objects }
  end
end
