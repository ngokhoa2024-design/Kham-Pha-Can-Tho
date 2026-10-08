/* ============================================================
   report.js — He thong bao cao noi dung / nguoi dung
   Kham Pha Can Tho

   BAO MAT:
   - Chi insert vao bang reports voi status = "pending".
   - Khong tu dong tru diem / ban / xoa noi dung.
   - Supabase RLS la lop bao mat thuc su.
   ============================================================ */

(function () {
    'use strict';

    var REPORT_REASONS = [
        'Spam',
        'Quang cao khong phu hop',
        'Lang ma / xuc pham',
        'Lua dao',
        'Quay roi',
        'Noi dung khong phu hop',
        'Khac'
    ];
    var MAX_DESC = 500;
    var _ctx  = null;
    var _modal = null;
    var _busy  = false;

    function notify(message) {
        var old = document.getElementById('rpt-toast');
        if (old) old.remove();
        var toast = document.createElement('div');
        toast.id = 'rpt-toast'; toast.textContent = message;
        toast.style.cssText = 'position:fixed;z-index:100000;left:50%;bottom:22px;transform:translateX(-50%);max-width:calc(100vw - 32px);padding:11px 15px;border-radius:8px;background:#323232;color:#fff;font:14px Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25)';
        document.body.appendChild(toast);
        setTimeout(function(){ toast.remove(); }, 3500);
    }

    function injectStyles() {
        if (document.getElementById('rpt-style')) return;
        var s = document.createElement('style');
        s.id = 'rpt-style';
        s.textContent = '#rpt-backdrop{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);align-items:center;justify-content:center;padding:16px;box-sizing:border-box}#rpt-backdrop.rpt-open{display:flex;animation:rptFI .18s ease}@keyframes rptFI{from{opacity:0}to{opacity:1}}#rpt-modal{background:#fff;border-radius:14px;padding:28px 28px 22px;width:100%;max-width:480px;box-shadow:0 12px 48px rgba(0,0,0,.22);position:relative;animation:rptSU .2s ease;box-sizing:border-box}@keyframes rptSU{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}#rpt-modal h3{margin:0 0 6px;font-size:1.1rem;font-weight:700;color:#1a1a1a;display:flex;align-items:center;gap:8px}#rpt-modal .rpt-sub{font-size:.82rem;color:#888;margin:0 0 18px}#rpt-modal .rpt-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.3rem;cursor:pointer;color:#999;line-height:1;padding:4px 8px;border-radius:6px;transition:background .15s}#rpt-modal .rpt-close:hover{background:#f0f0f0;color:#333}.rpt-lbl{font-size:.83rem;font-weight:600;color:#444;margin-bottom:10px;display:block}.rpt-reasons{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}.rpt-reasons label{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:8px;border:1.5px solid #e8e8e8;cursor:pointer;font-size:.88rem;color:#333;transition:border-color .15s,background .15s;user-select:none}.rpt-reasons label:hover{border-color:#0b8a7b;background:#f0fbfa}.rpt-reasons input[type=radio]{accent-color:#0b8a7b;width:16px;height:16px;flex-shrink:0}.rpt-desc-row{font-size:.83rem;font-weight:600;color:#444;display:flex;justify-content:space-between;margin-bottom:6px}.rpt-desc-row span{font-weight:400;color:#aaa;font-size:.78rem}#rpt-desc{width:100%;box-sizing:border-box;border:1.5px solid #e8e8e8;border-radius:8px;padding:10px 12px;font-size:.88rem;font-family:inherit;resize:vertical;min-height:80px;max-height:160px;outline:none;transition:border-color .15s;color:#333}#rpt-desc:focus{border-color:#0b8a7b}.rpt-cnt{text-align:right;font-size:.75rem;color:#bbb;margin-top:3px;margin-bottom:14px}.rpt-cnt.over{color:#e34646}.rpt-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:6px}.rpt-btn-c{padding:9px 20px;border-radius:8px;border:1.5px solid #ddd;background:#fff;color:#666;font-size:.88rem;font-weight:600;cursor:pointer;transition:background .15s}.rpt-btn-c:hover{background:#f5f5f5}.rpt-btn-s{padding:9px 22px;border-radius:8px;border:none;background:#0b8a7b;color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;transition:background .15s,opacity .15s;display:flex;align-items:center;gap:6px}.rpt-btn-s:hover:not(:disabled){background:#097062}.rpt-btn-s:disabled{opacity:.6;cursor:not-allowed}.rpt-msg{margin-top:12px;font-size:.84rem;padding:9px 13px;border-radius:8px;display:none}.rpt-msg.ok{display:block;background:#e6f9f1;color:#1a7a4c;border:1px solid #b0e8ce}.rpt-msg.err{display:block;background:#fef1f1;color:#c02020;border:1px solid #f2c2c2}.rpt-trigger-btn{background:none;border:1px solid transparent;color:#999;font-size:.8rem;cursor:pointer;padding:4px 9px;border-radius:6px;display:inline-flex;align-items:center;gap:5px;transition:color .15s,border-color .15s,background .15s;font-family:inherit;line-height:1.2}.rpt-trigger-btn:hover{color:#e07b2a;border-color:rgba(224,123,42,.13);background:#fff8f2}.rpt-trigger-btn.rpt-done{color:#888;pointer-events:none}@media(max-width:480px){#rpt-modal{padding:20px 16px 18px}.rpt-footer{flex-direction:column-reverse}.rpt-btn-c,.rpt-btn-s{width:100%;justify-content:center}}';
        document.head.appendChild(s);
    }

    function buildModal() {
        if (_modal) return;
        var bd = document.createElement('div');
        bd.id = 'rpt-backdrop';
        bd.setAttribute('role', 'dialog');
        bd.setAttribute('aria-modal', 'true');
        bd.setAttribute('aria-labelledby', 'rpt-title');
        var rh = REPORT_REASONS.map(function(r,i){
            return '<label><input type="radio" name="rpt_reason" value="'+esc(r)+'" id="rpt_r_'+i+'"><span>'+esc(r)+'</span></label>';
        }).join('');
        bd.innerHTML = '<div id="rpt-modal"><button class="rpt-close" id="rptClose" aria-label="Dong">&#x2715;</button><h3 id="rpt-title">&#x26A0;&#xFE0F; Bao cao noi dung</h3><p class="rpt-sub" id="rptSub"></p><span class="rpt-lbl">Ly do bao cao <span style="color:#e34646">*</span></span><div class="rpt-reasons">'+rh+'</div><div class="rpt-desc-row">Mo ta them <span id="rptCnt">0/'+MAX_DESC+'</span></div><textarea id="rpt-desc" placeholder="Mo ta chi tiet (khong bat buoc)..." maxlength="'+MAX_DESC+'"></textarea><div class="rpt-cnt" id="rptCntBot">0/'+MAX_DESC+' ky tu</div><div class="rpt-footer"><button class="rpt-btn-c" id="rptCancel">Huy</button><button class="rpt-btn-s" id="rptSubmit"><i class="fa-solid fa-paper-plane"></i><span>Gui bao cao</span></button></div><div class="rpt-msg" id="rptMsg"></div></div>';
        document.body.appendChild(bd);
        _modal = bd;
        bd.addEventListener('click', function(e){ if(e.target===bd) closeModal(); });
        document.getElementById('rptClose').addEventListener('click', closeModal);
        document.getElementById('rptCancel').addEventListener('click', closeModal);
        document.getElementById('rpt-desc').addEventListener('input', updCnt);
        document.getElementById('rptSubmit').addEventListener('click', doSubmit);
        document.addEventListener('keydown', function(e){ if(e.key==='Escape'&&_modal&&_modal.classList.contains('rpt-open')) closeModal(); });
    }

    function updCnt(){
        var el=document.getElementById('rpt-desc'), cnt=document.getElementById('rptCntBot');
        if(!el||!cnt) return;
        var len=(el.value||'').length;
        cnt.textContent=len+'/'+MAX_DESC+' ky tu';
        cnt.className='rpt-cnt'+(len>=MAX_DESC?' over':'');
    }

    async function openModal(ctx){
        var cl = window.supabaseClient;
        if (!cl) { notify('Không thể kết nối hệ thống báo cáo.'); return; }
        var auth = await cl.auth.getUser();
        if (!auth.data || !auth.data.user) {
            notify('Vui lòng đăng nhập để sử dụng chức năng báo cáo.');
            return;
        }
        if (ctx && ctx.reportedUserId && auth.data.user.id === ctx.reportedUserId) {
            notify('Bạn không thể tự báo cáo chính mình.');
            return;
        }
        injectStyles(); buildModal();
        _ctx=ctx; _busy=false;
        document.querySelectorAll('input[name="rpt_reason"]').forEach(function(r){r.checked=false;});
        var de=document.getElementById('rpt-desc'); if(de) de.value='';
        updCnt();
        var me=document.getElementById('rptMsg'); if(me){me.className='rpt-msg';me.textContent='';}
        var se=document.getElementById('rptSub'); if(se) se.textContent=ctx.sourceName?'Bao cao: '+ctx.sourceName:'Noi dung nay se duoc quan tri vien xem xet.';
        var bt=document.getElementById('rptSubmit'); if(bt){bt.disabled=false;bt.innerHTML='<i class="fa-solid fa-paper-plane"></i><span>Gui bao cao</span>';}
        _modal.classList.add('rpt-open');
    }

    function closeModal(){
        if(_modal) _modal.classList.remove('rpt-open');
        _ctx=null;
    }

    async function doSubmit(){
        if(_busy) return;
        var me=document.getElementById('rptMsg'), bt=document.getElementById('rptSubmit');
        var ri=document.querySelector('input[name="rpt_reason"]:checked');
        if(!ri){showMsg('Vui lòng chọn lý do báo cáo.','err');return;}
        var reason=ri.value, desc=(document.getElementById('rpt-desc').value||'').trim();
        var cl=window.supabaseClient; if(!cl){showMsg('Loi ket noi he thong.','err');return;}
        var ar=await cl.auth.getUser(), user=ar.data&&ar.data.user;
        if(!user){showMsg('Vui lòng đăng nhập để sử dụng chức năng báo cáo.','err');return;}
        if(_ctx&&_ctx.reportedUserId&&user.id===_ctx.reportedUserId){showMsg('Bạn không thể tự báo cáo chính mình.','err');return;}
        _busy=true; bt.disabled=true; bt.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i><span>Dang gui...</span>'; me.className='rpt-msg';
        try{
            var st=(_ctx&&_ctx.sourceType)||'other', si=(_ctx&&_ctx.sourceId)||null, ri2=(_ctx&&_ctx.reportedUserId)||null;
            var tenMin=new Date(Date.now()-10*60*1000).toISOString();
            var dq=cl.from('reports').select('id').eq('reporter_id',user.id).eq('source_type',st).gte('created_at',tenMin);
            if(si) dq=dq.eq('source_id',si); else if(ri2) dq=dq.eq('reported_user_id',ri2);
            var dr=await dq.limit(1);
            if(dr.data&&dr.data.length>0){showMsg('Bạn đã báo cáo nội dung này rồi.','err');_busy=false;bt.disabled=false;bt.innerHTML='<i class="fa-solid fa-paper-plane"></i><span>Gửi báo cáo</span>';return;}
            var ins=await cl.from('reports').insert({reporter_id:user.id,reported_user_id:ri2,reason:reason,description:desc||null,source_type:st,source_id:si,status:'pending'});
            if(ins.error) throw ins.error;
            showMsg('✅ Báo cáo đã được gửi. Quản trị viên sẽ xem xét nội dung này.','ok');
            bt.innerHTML='<i class="fa-solid fa-check"></i><span>Da gui</span>';
            if(_ctx&&_ctx.triggerBtn){_ctx.triggerBtn.innerHTML='<i class="fa-solid fa-check"></i> Da bao cao';_ctx.triggerBtn.classList.add('rpt-done');_ctx.triggerBtn.title='Da gui bao cao';}
            setTimeout(closeModal,2200);
        }catch(err){
            console.error('[ReportSystem] Loi:',err);
            showMsg('❌ Không thể gửi báo cáo. Vui lòng thử lại.','err');
            _busy=false;bt.disabled=false;bt.innerHTML='<i class="fa-solid fa-paper-plane"></i><span>Gui bao cao</span>';
        }
    }

    function showMsg(t,c){var el=document.getElementById('rptMsg');if(!el)return;el.textContent=t;el.className='rpt-msg '+c;}
    function esc(t){return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

    function createButton(opts){
        var btn=document.createElement('button');
        btn.type='button'; btn.className='rpt-trigger-btn';
        btn.title='Bao cao noi dung nay';
        btn.innerHTML='<i class="fa-solid fa-flag"></i> Bao cao';
        btn.addEventListener('click',function(e){
            e.stopPropagation();
            openModal({reportedUserId:opts.reportedUserId||null,sourceType:opts.sourceType||'other',sourceId:opts.sourceId||null,sourceName:opts.sourceName||'',triggerBtn:btn});
        });
        return btn;
    }

    window.ReportSystem={open:openModal,close:closeModal,createButton:createButton};
})();
