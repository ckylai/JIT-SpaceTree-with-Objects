class KnownObject < ActiveRecord::Base
  belongs_to :object_category

  # defines the JSON representation of the [known] object objects to be rendered in the JIT tree
  def as_json( options={} )
    { :id => id.to_s + "_obj", :name => name, :data => description, :children => [] }
  end
end
