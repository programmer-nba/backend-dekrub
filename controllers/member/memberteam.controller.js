const { Members } = require('../../models/member.model/member.model');

module.exports.GetMemberTeam = async (req, res) => {
    try {
        const member = await Members.findOne({ member_number: req.params.member_number });
        if (!member) {
            return res.status(403).send({ message: 'รหัสสมาชิกนี้ยังไม่ได้เป็นสมาชิกของ Dekrub Shop'});
        } else {
            const upline = [ member.upline.lv1, member.upline.lv2];
            const validUplines = upline.filter(item => item !== '-');
            const uplineData = [];
            let i = 0;
            for (const item of validUplines) {
                const include = await Members.findOne({ member_number: item});
                console.log('include : ', include);
                if (include !== null){
                    uplineData.push({
                        iden: include.iden.number,
                        name: include.name,
                        address: {
                            address: include.address,
                            subdistrict: include.subdistrict,
                            district: include.district,
                            province: include.province,
                            postcode: include.postcode
                        },
                        tel: include.tel,
                        level: (i+1)
                    });
                    i++;
                }
            }
            return res.status(200).send({
                message: 'ดึงข้อมูลสำเร็จ',
                data: [
                    uplineData[0] || null,
                    uplineData[1] || null,
                ]
            });

        }
    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: 'มีบางอย่างผิดพลาด' });
    }
}