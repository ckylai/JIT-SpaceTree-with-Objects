class AddDeletedToKnownObjects < ActiveRecord::Migration
  def change
    add_column :known_objects, :deleted, :boolean, :default => false
  end
end
