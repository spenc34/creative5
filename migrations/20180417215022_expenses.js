
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('expenses', function(table) {
      table.increments('id').primary();
      table.decimal('amount');
      table.string('description');
      table.string('category');
      table.string('date');
      table.string('month');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
      knex.schema.dropTable('expenses'),
  ]);
};
