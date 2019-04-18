
    //皮肤动画名字
    window.skins=[
        ['00_fish_G1_move','00_fish_G2_move','00_fish_G3_move'],
        ['01_fish_G1_move','01_fish_G2_move','01_fish_G3_move'],
        ['02_fish_G1_move','02_fish_G2_move','02_fish_G3_move'],
        ['04_fish_G1_move','04_fish_G2_move','04_fish_G3_move'],
        ['05_fish_G1_move','05_fish_G2_move','05_fish_G3_move'],
        ['06_fish_G1_move','06_fish_G2_move','06_fish_G3_move'],
        ['07_fish_G1_move','07_fish_G2_move','07_fish_G3_move'],
        ['08_fish_G1_move','08_fish_G2_move','08_fish_G3_move'],
        ['09_fish_G1_move','09_fish_G2_move','09_fish_G3_move'],
        ['10_fish_G1_move','10_fish_G2_move','10_fish_G3_move'],
        ['11_fish_G1_move','11_fish_G2_move','11_fish_G3_move'],
        ['12_fish_G1_move','12_fish_G2_move','12_fish_G3_move'],
        ['13_fish_G1_move','13_fish_G2_move','13_fish_G3_move'],
        ['14_fish_G1_move','14_fish_G2_move','14_fish_G3_move'],
        ['15_fish_G1_move','15_fish_G2_move','15_fish_G3_move'],
        ['16_fish_G1_move','16_fish_G2_move','16_fish_G3_move'],
        ['17_fish_G1_move','17_fish_G2_move','17_fish_G3_move'],
        ['18_fish_G1_move','18_fish_G2_move','18_fish_G3_move'],                      
    ];

    //boss动画名字
    window.spineName= [
        ['001_bigfish','001_bigfish_attack01','001_bigfish_attack02','001_bigfish_vertigo',
        '001_bigfish_hit','001_bigfish_death','001_bigfish_death_loop','001_bigfish_eat'],
        ['002_bigfish','002_bigfish_attack01','002_bigfish_attack02','002_bigfish_vertigo',
        '002_bigfish_hit','002_bigfish_death','002_bigfish_death_loop','002_bigfish_eat'],
        ['003_bigfish','003_bigfish_attack01','003_bigfish_attack02','003_bigfish_vertigo',
        '003_bigfish_hit','003_bigfish_death','003_bigfish_death_loop','003_bigfish_eat'],
        ['004_bigfish','004_bigfish_attack02','004_bigfish_attack01','004_bigfish_vertigo',
        '004_bigfish_hit','004_bigfish_death','004_bigfish_death_loop','004_bigfish_eat']
    ];

    //人物角色骨骼动画
    window.playerSpine=["00_fish","01_fish","02_fish","04_fish","05_fish","06_fish","07_fish","08_fish",
    "09_fish","10_fish","11_fish","12_fish","13_fish","14_fish","15_fish","16_fish","17_fish","18_fish"],

    //boss Duration      
    window.duration=[1,2.5,1.5,3,3,0.8,1,1.7];

    //boss bullet
    window.bullet=['bullet01_ef','bullet_iron_ef'];

    //成就描述
    window.ach_desc=[["拿到2000个星星",2000,100,1],
                     ["跳跃到第3关",3,100,2],
                     ["勇气值达到5000分",5000,100,3],
                     ["踏过500个跳板",500,100,4],
                     ["做过5次火箭",5,100,5],
                     ["拿到3000个星星",3000,150,1],
                     ["跳跃到第8关",8,180,2],
                     ["勇气值达到15000分",15000,200,3],
                     ["踏过1000个跳板",1000,200,4],
                     ["做过15次火箭",15,200,5],
                     
    ];
    window.ach_data={
                star:0,
                checkpoint:1,
                score:0,
                platform:0,
                rocket:0,
    };


    window.isanno=false;