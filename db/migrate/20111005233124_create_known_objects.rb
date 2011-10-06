class CreateKnownObjects < ActiveRecord::Migration
  def change
    create_table :known_objects do |t|
      t.integer :object_category_id
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
