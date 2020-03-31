'use strict'

$(document).ready(function(){
  function deserialize(form, serializedString){
    form[0].reset();
    serializedString = serializedString.replace(/\+/g, '%20');
    var formFieldArray = serializedString.split("&");
    $.each(formFieldArray, function(i, pair){
        var nameValue = pair.split("=");
        var name = decodeURIComponent(nameValue[0]);
        var value = decodeURIComponent(nameValue[1]);
        // Find one or more fields
        var $field = form.find('[name=' + name + ']');
        $field.val(value);
    });
  }

  function load_attack_template(){
    const attack_template = localStorage.getItem('attack_template');
    if(attack_template != '' && attack_template != null){
      $('#select-attack-template').val(attack_template);
    }
  }

  function load_template(template){
    const template_form = $('#form-'+template);
    const key = 'template_'+template;
    const value = localStorage.getItem(key);
    if(value != '' && value != null){
      deserialize(template_form, value);
    }
  }

  function show_template_form(){
    const templates = ['default', 'sotdl']
    const template = $('#select-attack-template option:selected').val();
    const index = templates.indexOf(template);
    templates.splice(index, 1)
    for(let i = 0; i < templates.length; i++){
      $('#form-'+templates[i]).hide();
    }
    $('#form-'+template).show();
  }

  function create_button(title, style, callback){
    return $('<button/>', {'text': title, 'class': 'menu-button', 'style': style, 'click': callback})
  }

  function create_input(template, name, example){
    return $('<input/>', {'id': 'input-'+template+'-'+name, 'type': 'text', 'placeholder': example, 'name': name, 'style': 'color: black;'});
  }

  function create_label(name, text){
    return $('<label/>', {'for': name, 'text': text});
  }

  function create_form(template){
    const generic_form = $('<form/>', {'id': 'form-'+template});
    generic_form.submit(function(){return false;});
    return generic_form
  }

  function create_option(option){
    return $('<option/>', {'value': option.value, 'text': option.text});
  }

  function create_template_select(){
    const select = $('<select/>', {'id': 'select-attack-template'});
    select.append(create_option({'value': 'default', 'text': 'Default'}));
    select.append(create_option({'value': 'sotdl', 'text': 'SotDL'}));
    select.change(show_template_form);
    return select;
  }

  function create_template_form(template){
    const template_form = create_form(template.name);
    for(let i = 0; i < template.options.length; i++){
      template_form.append(create_label(template.options[i].name, template.options[i].text));
      template_form.append(create_input(template.name, template.options[i].name, template.options[i].example));
    }
    template_form.append(create_button('Save', 'display: block;', template.callback))
    template_form.hide();
    return template_form;
  }

  function create_forms_div(templates){
    const form_div = $('<div/>', {'id': 'div-config-attack', 'style': 'margin-top: 15px;'});
    form_div.append($('<h1>Configuration</h1>'));
    form_div.append(create_template_select());
    for (let i = 0; i < templates.length; i++){
      form_div.append(create_template_form(templates[i]));
    }
    form_div.hide();
    return form_div;
  }

  function save_template(template){
    return function (){
      const template_form = $('#form-'+template);
      const key = 'template_'+template;
      const value = template_form.serialize();
      localStorage.setItem(key, value);
      localStorage.setItem('attack_template', template)
    };
  }

  function get_attack_roll(){
    const template = $('#select-attack-template option:selected').val();
    const form = $('#form-'+template);
    switch(template){
      case 'default':
        return "&{template:default} {{name=" + form.find('[name=title]').val() + "}} {{attack=[[" + form.find('[name=attack]').val() + "]]}} {{damage=[[" + form.find('[name=damage]').val() + "]]}}";
      case 'sotdl':
        return "@{" + form.find('[name=name]').val() + "|output_option} &{template:sotdl} @{" + form.find('[name=name]').val() + "|setting_show_name} {{title=" + form.find('[name=title]').val() + "}} {{showroll=1}} {{roll-label=^{ATTACK}}} {{roll=[[" + form.find('[name=attack]').val() + "]]}} {{versus=^{DEFENSE}}} {{damage=1}} {{damageroll=[[" + form.find('[name=damage]').val() + "]]}} {{description=" + form.find('[name=weapon]').val() + "}}";
      default:
        return '/roll 1d20';
    }
  }

  function attack_roll(){
    $('.ui-autocomplete-input').val(get_attack_roll());
    $('#textchat-input .btn').click();
  }

  function template_config(){
    $('#div-config-attack').toggle();
  }

  const default_template = {
    'name': 'default',
    'callback': save_template('default'),
    'options': [
      {'name': 'title', 'text': 'Title', 'example': 'Bilbo\'s attack!'},
      {'name': 'attack', 'text': 'Attack', 'example': '1d20+2'},
      {'name': 'damage', 'text': 'Damage', 'example': '1d6+1'},
    ],
  };

  const sotdl_template = {
    'name': 'sotdl',
    'callback': save_template('sotdl'),
    'options': [
      {'name': 'name', 'text': 'Name', 'example': 'Bilbo'},
      {'name': 'title', 'text': 'Title', 'example': 'Bilbo\'s attack!'},
      {'name': 'weapon', 'text': 'Weapon', 'example': 'Staff'},
      {'name': 'attack', 'text': 'Attack', 'example': '1d20+2'},
      {'name': 'damage', 'text': 'Damage', 'example': '1d6+1'},
    ],
  };

  const templates = [default_template, sotdl_template];

  // create menu
  const menu_div = $('<div/>', {'id': 'div-menu-attack', 'class': 'menu'});
  menu_div.append($('<p class="menu-header" style="text-align: center;">Roll</p>'))
  menu_div.append(create_button('Config', 'margin-right: 5px;', template_config));
  menu_div.append(create_button('Attack', '', attack_roll));
  menu_div.append(create_forms_div(templates))
  menu_div.draggable();
  menu_div.appendTo('body');
  for(let i = 0; i < templates.length; i++){
    load_template(templates[i].name)
  }
  load_attack_template();
  show_template_form();
});
