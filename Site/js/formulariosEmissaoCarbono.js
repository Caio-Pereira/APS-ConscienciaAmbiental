


// Formatação vísual dos formulários de 'Emissão Carbono'

/**
 * Show the given form id and hide the other forms in the array
 * 
 * @param {string} chossedForm - Form id 
 * @returns {null} Null
 */
function chooseForm(chossedForm) {
    const visible = "flex"
    const hidden  = "none"
    
    const forms = ['EmissaoCarbonoVehicleForm','EmissaoCarbonoVooForm','EmissaoCarbonoEntregaForm','EmissaoCarbonoCombustivelForm']
    
    for (let i = 0; i < forms.length; i++) {
        if (forms[i] === chossedForm) {
            document.getElementById(forms[i]).style.display = visible;
            document.getElementById(forms[i].replace('Form','Titulo')).style.display = visible;
        } else {
            document.getElementById(forms[i]).style.display = hidden;
            document.getElementById(forms[i].replace('Form','Titulo')).style.display = hidden;
        }
    }
}
    
const btnVehicleForm     = document.getElementById('btnVehicleForm');
const btnVooForm         = document.getElementById('btnVooForm');
const btnEntregaForm     = document.getElementById('btnEntregaForm');
const btnCombustivelForm = document.getElementById('btnCombustivelForm');

btnVehicleForm.addEventListener("click", function() {
    chooseForm('EmissaoCarbonoVehicleForm')
});
btnVooForm.addEventListener("click", function() {
    chooseForm('EmissaoCarbonoVooForm')
});
btnEntregaForm.addEventListener("click", function() {
    chooseForm('EmissaoCarbonoEntregaForm')
});
btnCombustivelForm.addEventListener("click", function() {
    chooseForm('EmissaoCarbonoCombustivelForm')
});


// Garante o filtro de um campo de entrada baseado no valor selecionado em outro campo 
    // Formulário Voo
    $('#inputAeroportoOrigem').hide();
    $('#inputAeroportoDestino').hide();
    $('#inputVehicle').hide();

    $("#inputPaisOrigem").change(function() {
        var ids = ($(this).find(":selected").data('origem') + "").split(",");
        var n = null;
        $('#inputAeroportoOrigem option').hide().filter(function() {
            var p = ids.indexOf($(this).val()) > -1;
            if (p && n == null) {
            n = $(this).val()
            }
            return p
        }).show();
        $('#inputAeroportoOrigem').show();
        $('#inputAeroportoOrigem').val(n)
    });

    $("#inputPaisDestino").change(function() {
        var ids = ($(this).find(":selected").data('destino') + "").split(",");
        var n = null;
        $('#inputAeroportoDestino option').hide().filter(function() {
            var p = ids.indexOf($(this).val()) > -1;
            if (p && n == null) {
            n = $(this).val()
            }
            return p
        }).show();
        $('#inputAeroportoDestino').show();
        $('#inputAeroportoDestino').val(n)
    });

    // Formulário Veículos
    $("#inputVehicleMaker").change(function() {
        var ids = ($(this).find(":selected").data('vehicles') + "").split(",");
        var n = null;
        $('#inputVehicle option').hide().filter(function() {
            var p = ids.indexOf($(this).val()) > -1;
            if (p && n == null) {
            n = $(this).val()
            }
            return p
        }).show();
        $('#inputVehicle').show();
        $('#inputVehicle').val(n)
    });