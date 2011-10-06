class CreateObjectCategories < ActiveRecord::Migration
  def change
    create_table :object_categories do |t|
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
