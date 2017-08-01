app.service('utility', function () {
    this.confirm = (msg, callback) => {
        $('#btn_yes').off('click').on('click', callback);
        $('#confirmModal #msg').html(msg);
        $('#confirmModal').modal('show');
    }
    this.closeModal = (selector) => {
        if (selector == undefined) selector = '#confirmModal';
        $(selector).modal('hide');
    }
    this.loader = (state) => {
        if (state == 'show')
            $('.loader').show();
        else
            $('.loader').hide();
    }
});