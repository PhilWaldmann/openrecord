// Note: putting e.g. openrecord/store/postgres.d.ts into this directory (`/types`) does not work.
// TypeScript won't load it. even if we use `/// <reference path="./postgres.d.ts" />` or delcare the "openrecord/store/postgres" module in `index.d.ts`
// I'm not sure what's the problem.
// To get around this problem, all store dependent type definitions are inside `/store` beside the actual source.

declare module "openrecord" {

  interface StoreConfig {
    /** Type of database or store you want to connect.
     * Values are: `sqlite3`, `postgres`, `mysql`, `oracle`, `rest`, `ldap` or `activedirectory`
     */
    type: string

    /** Path to the database file (sqlite3 only) */
    file?: string

    /** Hostname or IP of the server running your database (postgres, mysql and oracle only) */
    host?: string
    /** The database name (postgres, mysql and oracle only) */
    database?: string
    /** Username for your database (postgres, mysql, oracle, ldap/activedirectory only) */
    user?:  string
    /** Password for your database (postgres, mysql, oracle, ldap/activedirectory only) */
    password?:  string
    /** URL to your backen (ldap/activedirectory and rest only) */
    url?: string
    /** The base DN of your ldap tree (ldap/activedirectory only) */
    base?: string

    /** Set to false if you don't want to connect to your database immediately (sqlite3, postgres, mysql and oracle only) */
    autoConnect?: boolean
    /** Set to false if you don't want to automatically define your model attributes via your database tables (sqlite3, postgres, mysql and oracle only) */
    autoAttributes?: boolean
    /** Set to true if you want all your models automatically created from your database tables (sqlite3, postgres, mysql and oracle only)
     * With a postgres database it will take the public schema by default to get your tables. If you want to change that, set autoLoad to the schema name instead of true.
     */
    autoLoad?: boolean

    /** The name of the store. Only needed if you use multiple stores and relations between them. */
    name?: string
    /** Set to true if you want your Models defined in the global scope (not recommended). */
    global?: boolean
    /** Add a prefix to your model name (in combination with global only). */
    globalPrefix?: string

    /** Set the default value for autoSave on all relations */
    autoSave?: boolean
    /** OPENRECORD will take your model name and pluralizes it to get e.g. the table name with the help of the inflection module
     * If you want to overwrite certain names, pass an object with the format {'wrong name': 'right name'}.
     */
    inflection?: object

    /** Array of plugins (See Plugins) */
    plugins?: ReadonlyArray<object> | ReadonlyArray<string>
    /** Array of models (See Definition) */
    models?: ReadonlyArray<object> | ReadonlyArray<string>
    /** Array of migrations (See Migrations) */
    migrations?: ReadonlyArray<object> | ReadonlyArray<string>
  }

  type Condition = (string|[string, any[]]|{
    [name: string]: any
  })

  class Model {
    constructor()
    /**
     * Initialize a new Record.
     * You could either use
     * ```js
     * var records = new Model();
     * // or via
     * var records = Model.new();
     * ```
     * @param data The records attributes
     */
    static new(data?: object, castType?: string): Model

    /**
     * Creates a new record and saves it
     * @param data The data of the new record
     */
    static create(data: object): Promise<Model>

    static chain(options?: {
      clone?: boolean
      exclude?: string[]
    }): typeof Collection
    static clone(options?: {
      clone?: boolean
      exclude?: string[]
    }): typeof Collection

    /**
     * `exec()` will return raw JSON instead of records
     */
    static asJson(): typeof Collection

    /**
     * `exec()` will return the raw store output
     * Be aware, that no `afterFind` hook will be fired if you use `asRaw()`.
     */
    static asRaw(): typeof Collection

    /**
     * Find one or multiple records by their primary key
     * @param id The records primary key
     */
    static find(id: number): typeof Collection
    static find(id: number[]): typeof Collection
    static find(id: string): typeof Collection
    static find(id: string[]): typeof Collection

    /**
     * Similar to `find`, but it will throw an error if there are no results
     * @param id The records primary key
     */
    static get(id: number): typeof Collection
    static get(id: number[]): typeof Collection
    static get(id: string): typeof Collection
    static get(id: string[]): typeof Collection


    /**
     * Set some conditions
     * @param conditions every key-value pair will be translated into a condition
     */
    static where(condition: Condition): typeof Collection

    /**
     * Adds a context object to your Model which could be used by your Hooks, Validation or Events via `this.context`
     * This is especially usefull need to differentiate things based on e.g. the cookie. Just set the context to the current request (`Model.setContext(req).create(params))` and use `this.context` inside your `beforeCreate()` hook.
     * The `context` Variable is available on your Model an all it's Records.
     * @param context Your context object
     */
    static setContext(context: any): typeof Collection

    /**
     * Executes the find
     */
    static exec(): Promise<Collection>
    static then(resolve: (result: (Collection|Model)) => (Promise<any>|void), reject?: () => any): (Collection|Model)

    /**
     * When called, it will throw an error if the resultset is empty
     */
    static expectResult(): typeof Collection

    /**
     * Include relations into the result
     * @param includes array or nested object of relation names to include
     */
    static include(includes: string): typeof Collection
    static include(includes: string[]): typeof Collection
    static include(includes: object): typeof Collection
    static include(includes: object[]): typeof Collection

    static callInterceptors(name: string, scope: any, args: any, options?: {
      executeInParallel: boolean
    }): Promise<any>


    /**
     * Limit the resultset to `n` records
     * @param limit The limit as a number.
     * @param offset Optional offset.
     */
    static limit(limit: number, offset?: number): typeof Collection

    static first(limit?: boolean): typeof Collection
    static singleResult(limit?: boolean): typeof Collection

     /**
     * Sets only the offset
     * @param offset The offset.
     */
    static offset(offset: number): typeof Collection

    static callParent(...args: any[]): any

    //GRAPHQL

    /**
     * returns a string represing the model as a graphql type
     * @param options Optional options
     */
    static toGraphQLType(options?: {
      /**
       * Overwrite the type name (Default: Model name)
       */
      name?: string,
      /**
       * Set a description for the type
       */
      description?: string,
      /**
       * Array of fields to exclude
       */
      exclude?: string[]
    }): string

    // LDAP
    static searchRoot(root: string, recursive?: boolean): typeof Collection
    static searchScope(scope: string): typeof Collection
    static recursive(recursiv: boolean): typeof Collection
    static select(fields: string[]): typeof Collection

    // SQL

    /**
     * Count the number of records in the database (SQL: `COUNT()`)
     * @param field Optional field name. (Default: `*`)
     * @param distinct Optional: DISTINCT(field). (Default: false)
     */
    static count(field?: string, distinct?: boolean): typeof Collection

    /**
     * Calculates the sum of a certain field (SQL: `SUM()`)
     * @param field The field name.
     */
    static sum(field: string): typeof Collection

    /**
     * Calculates the maximum value of a certain field (SQL: `MAX()`)
     * @param field The field name.
     */
    static max(field: string): typeof Collection

    /**
     * Calculates the minimum value of a certain field (SQL: `MAX()`)
     * @param field The field name.
     */
    static min(field: string): typeof Collection

    /**
     * Calculates the average value of a certain field (SQL: `MAX()`)
     * @param field The field name.
     */
    static avg(field: string): typeof Collection

    static toSQL(): Promise<string>

    /**
     * Specify SQL group fields.
     * @param fields The field names
     */
    static group(fields: string[]): typeof Collection

    /**
     * SQL Having conditions
     * @param condition every key-value pair will be translated into a condition
     */
    static having(condition: Condition): typeof Collection

    /**
     * Joins one or multiple relations with the current model
     * @param relation The relation name which should be joined.
     * @param type Optional join type (Allowed are `left`, `inner`, `outer` and `right`).
     */
    static join(relation: string, type?: string): typeof Collection
    static join(relation: string[], type?: string): typeof Collection
    static join(relation: object, type?: string): typeof Collection
    static join(... relation: string[]): typeof Collection

    /**
     * Left joins one or multiple relations with the current model
     * @param relation The relation name which should be joined.
     */
    static leftJoin(relation: string, type?: string): typeof Collection
    static leftJoin(relation: string[], type?: string): typeof Collection
    static leftJoin(relation: object, type?: string): typeof Collection

    /**
     * Right joins one or multiple relations with the current model
     * @param relation The relation name which should be joined.
     */
    static rightJoin(relation: string, type?: string): typeof Collection
    static rightJoin(relation: string[], type?: string): typeof Collection
    static rightJoin(relation: object, type?: string): typeof Collection

    /**
     * Inner joins one or multiple relations with the current model
     * @param relation The relation name which should be joined.
     */
    static innerJoin(relation: string, type?: string): typeof Collection
    static innerJoin(relation: string[], type?: string): typeof Collection
    static innerJoin(relation: object, type?: string): typeof Collection

    /**
     * Outer joins one or multiple relations with the current model
     * @param relation The relation name which should be joined.
     */
    static outerJoin(relation: string, type?: string): typeof Collection
    static outerJoin(relation: string[], type?: string): typeof Collection
    static outerJoin(relation: object, type?: string): typeof Collection

    /**
     * Set a sort order
     * @param columns Array of field names.
     * @param desc Optional: Set to `true` to order descent
     */
    static order(columns: string, desc: boolean): typeof Collection
    static order(columns: string[], desc: boolean): typeof Collection

    /**
     * execute raw sql
     * @param sql The raw sql query.
     * @param attrs Query attributes.
     */
    static raw(sql: string, attrs: any[]): Promise<any>


    /**
     * Updates all records which match the conditions. beforeSave, afterSave, beforeUpdate and afterUpdate want be called!
     */
    static update(attributes: object, options?: {
      transaction?: any
    }): Promise<void>
    static updateAll(attributes: object, options?: {
      transaction?: any
    }): Promise<void>

    /**
     * Deletes all records which match the conditions. beforeDestroy and afterDestroy want be called!
     * Be careful with relations: The `dependent` option is not honored
     */
    static delete(): Promise<void>
    static deleteAll(): Promise<void>

    /**
     * Loads all records at first and calls destroy on every single record. All hooks are fired and relations will be deleted if configured via options `dependent`
     */
    static destroy(): Promise<void>
    static destroyAll(): Promise<void>

    /**
     * Specify SQL select fields. Default: *
     * @param fields The field names
     */
    static select(fields: string): typeof Collection
    static select(fields: string[]): typeof Collection

    /**
     * Add the current query into a transaction
     * @param transaction The transaction object
     */
    static useTransaction(transaction: any): typeof Collection


    // =======
    //  MODEL
    // =======

    /**
     * Set one or multiple attributes of a Record.
     * @param name - The attributes name
     * @param value - The attributes value
     */
    set(name: string, value: any): this
    set(value: object): this

    /**
     * Get an attributes.
     * @param name - The attributes name
     */
    get(name: string): any

    /**
     * Returns `true` if there are any changed values in that record
     */
    hasChanges(): boolean

    /**
     * Returns `true` if the given attributes has changed
     * @param name - The attributes name
     */
    hasChanged(name: string): boolean

    /**
     * Returns an object with all the changes. One attribute will always include the original and current value
     */
    getChanges(): object

    /**
     * Returns an object with all changed values
     */
    getChangedValues(): object

    /**
     * Resets all changes to the original values
     */
    resetChanges(): this

    /**
     * Include relations into the result
     * @param includes array or nested object of relation names to include
     */
    include(includes: string): typeof Collection
    include(includes: string[]): typeof Collection
    include(includes: object): typeof Collection
    include(includes: object[]): typeof Collection


    inspect(indent: number, nested:boolean): string

    callInterceptors(name: string, scope: any, args: any, options?: {
      executeInParallel: boolean
    }): Promise<any>

    /**
     * Returns an object which represent the record in plain json
     */
    toJson(): object

    callParent(...args: any[]): any

    clearRelations(): this

    /**
     * Save the current record
     */
    save(): Promise<Model>

    /**
     * validates the record
     */
    validate(): Promise<Model>

    /**
     * validates the record and returns true or false
     */
    isValid(): Promise<boolean>

    /**
     * Destroy a record
     */
    destroy(): Promise<void>

    // LDAP
    destroyAll(): Promise<void>

    /**
     * Deletes the record. beforeDestroy and afterDestroy want be called!
     * Be careful with relations: The `dependent` option is not honored
     */
    delete(): Promise<void>
  }

  class Collection extends Model{
    /**
     * Adds new Records to the collection
     * @param records - Either an object which will be transformed into a new Record, or an existing Record
     */
    static add(records: Model): typeof Collection
    static add(records: object): typeof Collection
    static add(records: Model[]): typeof Collection
    static add(records: object[]): typeof Collection

    /**
     * Removes a Record from the Collection
     * @param item - Removes the record on the given index or record
     */
    static remove(item: Model): typeof Collection
    static remove(item: number): typeof Collection

    static clear(): typeof Collection

    static temporaryDefinition(fn?: (this: Definition) => void): Definition

    /**
     * Returns an array of objects which represent the records in plain json
     */
    static toJSON(): string

    static save(): Promise<typeof Collection>
  }


  interface RelationOptions{
    /** The target model name as a string */
    model?: string
    /** Optional store name. Only needed for cross store relations! */
    store?: string
    /** The name of the field of the current model */
    from?: string
    /** The name of the field of the target model */
    to?: string
    /** The relation name of the current model you want to go through */
    through?: (string | string[])
    /** The relation name of the target model. Use only in conjunction with through. Default is the name of your relation */
    relation?: string
    /** Set the <polymorhic name>. See belongsToPolymorphic() */
    as?: string
    /** Optional conditions object (See Query) */
    conditions?: Condition
    /** Optional name of a scope of the target model */
    scope?: string
    /** What should happen with the related record after a record of this model will be deleted. Valid values are: destroy, delete, nullify or null. (Default: null) */
    dependent?: string
    /** Automatically save loaded or new related records (See save and setup) */
    autoSave?: boolean
    /** Set to false to disable autom. bulk fetching of relational data (Default: true) */
    bulkFetch?: boolean
    /** Graphql Options */
    graphql?: object
  }

  interface RawRelationOptions extends RelationOptions{
    type: string
    preInitialize?: () => void
    initialize?: () => void
    loadWithCollection?: (collection: Collection) => void
    loadFromRecord?: (parentRecord: Model, include: object) => any
    collection?: (parentRecord: Model) => Collection
    getter?: () => any
    rawGetter?: () => any
    setter?: (value: any) => any
  }


  interface ValidatesFormatOfOptions{
    /** Skip validation if value is null */
    allow_null?: boolean
  }

  interface ValidatesNumericalityOfOptions{
    // Skip validation if value is null
    allow_null?: boolean
    // value need to be equal `eq`
    eq?: number
    // value need to be greater than `gt`
    gt?: number
    // value need to be greater than or equal `gte`
    gte?: number
    // value need to be lower than `lt`
    lt?: number
    // value need to be lower than or equal `lte`
    lte?: number
    // value need to be even
    even?: boolean
    // value need to be odd
    off?: boolean
  }


  interface Definition {
    getName(): string
    include(mixin: object): void
    /**
     * Add a new attribute to your Model
     * @param name The attribute name
     * @param type The attribute type (e.g. `text`, `integer`, or sql language specific. e.g. `blob`)
     * @param options Optional options
     */
    attribute(name: string, type: string, options?: {
      /**
       * make it writeable (Default: true)
       */
      writable?: boolean
      /**
       * make it readable (Default: true)
       */
      readable?: boolean
      /**
       * Default value
       */
      default?: any
      /**
       * emit change events `name_changed` (Default: false)
       */
      emit_events?: boolean
    }): this

    cast(attribute: string, value: any, castName?: string, record?: Model): any

    /**
     * Add a custom getter to your record
     * @param name The getter name
     * @param fn The method to call
     */
    getter(name: string, fn: (this: Model) => any): this

    /**
     * Add a custom setter to your record
     * @param name The setter name
     * @param fn The method to call
     */
    setter(name: string, fn: (this: Model, value: any) => void): this

    /**
     * Add a variant method to the specified attribute
     * @param name The attribute name
     * @param fn The method to call
     */
    variant(name: string, fn: (this: Model, value: any, args: any) => any): this

    /**
     * add a special convert function to manipulate the input (e.g. via `set()`) value of an attribute
     * @param attribute The attribute name
     * @param fn The convert function
     * @param forceType Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
     */
    convertInput(attribute: string, fn: (this: Model, value: any) => any, forceType: boolean): this

    /**
     * add a special convert function to manipulate the output (`toJson()`) value of an attribute
     * @param attribute The attribute name
     * @param fn The convert function
     * @param forceType Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
     */
    convertOutput(attribute: string, fn: (this: Model, value: any) => any, forceType: boolean): this

    /**
     * add a special convert function to manipulate the read (`exec()`) value of an attribute
     * @param attribute The attribute name
     * @param fn The convert function
     * @param forceType Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
     */
    convertRead(attribute: string, fn: (this: Model, value: any) => any, forceType: boolean): this

    /**
     * add a special convert function to manipulate the write (`save()`) value of an attribute
     * @param attribute The attribute name
     * @param fn The convert function
     * @param forceType Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
     */
    convertWrite(attribute: string, fn: (this: Model, value: any) => any, forceType: boolean): this



    addInterceptor(name: string, fn: (...args: any[]) => Promise<any>, priority?: number): this

    callInterceptors(name: string, scope: any, args: any, options?: {
      executeInParallel: boolean
    }): Promise<any>


    /**
     * Adds a new method to the record
     * @param name The name of the method
     * @param fn The function
     */
    method(name: string, fn: (this: Model, ...args: any[]) => any): this

    /**
     * Adds a new method to the class
     * @param name The name of the method
     * @param fn The function
     */
    staticMethod(name: string, fn: (this: typeof Model, ...args: any[]) => any): this

    /**
     * mixin a module to extend your model definition.
     * The module needs to export either a function, which will be called with the definition scope
     * or an objects which will be mixed into the defintion object.
     * @param module the module
     */
    mixin(module: (this: Definition) => void): this
    mixin(module: object): this

    callParent(...args: any[]): any

    belongsToMany(name: string, options?: RelationOptions): this

    belongsToPolymorphic(name: string, options?: RelationOptions): this

    belongsTo(name: string, options?: RelationOptions): this

    hasMany(name: string, options?: RelationOptions): this

    has(name: string, options?: RawRelationOptions): this

    /**
     * Creates a custom chained Model method
     * @param name The name of the scope
     * @param fn The scope function
     */
    scope(name:string, fn:(this: Model, ...args:any[]) => any):this

    /**
     * Adds a default scope
     * @param name The name of the scope
     */
    defaultScope(name: string): this


    /**
     * Validate any field with a custom function.
     * Synchronous: just return `true` or `false`
     * Asynchronous: put a `done` parameter into your callback and call `done()` when finished.
     * @param fields The fields to validate
     * @param fn The validation callback
     */
    validates(fields: string[], fn: (this: Model) => (boolean | Promise<boolean>)): this
    validates(fields: string, fn: (this: Model) => (boolean | Promise<boolean>)): this

    /**
     * This validator checks the given field`s value is not null.
     * @param fields The fields to validate
     */
    validatesPresenceOf(fields: string[]): this
    validatesPresenceOf(fields: string): this

    /**
     * This validator checks if the given field`s value and <field_name>_confirmation are the same.
     * @param fields The fields to validate
     */
    validatesConfirmationOf(fields: string[]): this
    validatesConfirmationOf(fields: string): this


    /**
     * This validator checks the format of a field.
     * Valid format types are:
     * * `email`
     * * `url`
     * * `ip`
     * * `uuid`
     * * `date`
     * * null
     * * Regular expression
     * @param fields The fields to validate
     * @param format The format type
     * @param options The options hash
     * @param options.allow_null Skip validation if value is null
     */
    validatesFormatOf(field: string, format: string, options?: ValidatesFormatOfOptions): this
    validatesFormatOf(field: string[], format: string, options?: ValidatesFormatOfOptions): this
    validatesFormatOf(field: string, format: RegExp, options?: ValidatesFormatOfOptions): this
    validatesFormatOf(field: string[], format: RegExp, options?: ValidatesFormatOfOptions): this
    validatesFormatOf(field: string, format: null, options?: ValidatesFormatOfOptions): this
    validatesFormatOf(field: string[], format: null, options?: ValidatesFormatOfOptions): this

    /**
     * This validator checks if the given field`s values length is lesss than or equal `length`.
     * @param field The field to validate
     * @param length The maximum length
     */
    validatesLengthOf(field: string, length: number): this
    validatesLengthOf(field: string[], length: number): this

    /**
     * This validator checks if the given field`s values is an allowed value
     * @param field The field to validate
     * @param allowedValues The array of allowed values
     */
    validatesInclusionOf(field: string, allowedValues: any[]): this
    validatesInclusionOf(field: string[], allowedValues: any[]): this

    /**
     * This validator checks the given field`s values against some rules.
     * @param field The field to validate
     * @param options The options
     */
    validatesNumericalityOf(field: string, options: ValidatesNumericalityOfOptions)
    validatesNumericalityOf(field: string[], options: ValidatesNumericalityOfOptions)





    // GRAPHQL PLUGIN
    graphQLDescription(description: string): this
    graphQLField(schema: string): this
    graphQLExclude(): this
    graphQLExcludeField(field: string): this
    graphQLQuery(schema: string): this
    graphQLMutation(schema: string): this
    graphQL(schema: string): this
    graphQL(schema: () => any, name: string): this
    graphQLResolver(resolver: object): this
    graphQLTypeResolver(resolver: object): this
    graphQLQueryResolver(resolver: object): this
    graphQLMutationResolver(resolver: object): this



    // LDAP
    /**
     * Set the rdn prefix
     * @param prefix The prefix
     */
    rdnPrefix(prefix: string): this
    dn(record: Model): string
    hasChildren(name: string, options: RelationOptions): this
    hasParent(name: string, options: RelationOptions): this
    isContainer(rdnPrefix: string): this


    // REST
    addBaseParam(name: string, value: any): this

    // SQL
    /**
     * Enable automatic joins on tables referenced in conditions
     * @param options Optional configuration options
     */
    autoJoin(options?: {
      relations?: string[]
    }): this
    /**
     * This validator checks the uniqness of the given field`s value before save.
     * @param {array} fields The fields to validate
     * @or
     * @param {string} fields The field to validate
     * @param {object} options Optional: Options hash
     *
     * @options
     * @param {string} scope Set a scope column
     *
     * @return {Definition}
     */
    validatesUniquenessOf(field: string, options?: {
      scope: string
    }): this
    validatesUniquenessOf(field: string[], options?: {
      scope: string
    }): this

    //SQL PLUGIN
    nestedSet(): this
    paranoid(): this
    serialize(attribute: string, serializer: {
      parse: (value: string) => object
      stringify: (value: object) => string
    }): this
    sortedList(options?: {
      scope: string
      insert: string
    }): this
    stampable(): this
  }





  type StaticModel = typeof Model
  // for es6 classes
  interface BaseModel extends StaticModel{
    definition(this: Definition): void
  }


  class Store {
    constructor(config: StoreConfig)

    ready(next?: () => void): Promise<void>
    Model(name: string, fn: (this: Definition) => void): void
    Model(name: string): typeof Model

    static BaseModel: BaseModel
  }

  export = Store
}
