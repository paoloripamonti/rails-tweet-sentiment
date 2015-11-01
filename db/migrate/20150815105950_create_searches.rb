class CreateSearches < ActiveRecord::Migration
  def change
    create_table :searches do |t|
      t.string    :text,    :limit=>4000
      t.string    :lang
      t.integer   :result
      t.float	    :sentiment
      t.boolean   :success, :default=>false
      t.timestamps null: false
    end
  end
end
