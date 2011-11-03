class AddDeletedToObjectCategories < ActiveRecord::Migration
  def up
    change_table :object_categories do |t|
      t.boolean :deleted, :default => false
    end
  end
  
  def down
    remove_column :object_categories, :deleted
  end
end
