Template.configureLoginServiceDialogForReddit.siteUrl = function () {
  return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForReddit.fields = function () {
  return [
    {property: 'appId',  label: 'App ID'},
    {property: 'secret', label: 'Secret'}
  ];
};
