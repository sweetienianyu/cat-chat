"""初始化演示数据：python -m app.seed"""

from urllib.parse import quote

from sqlalchemy import delete, func, select

from .database import Base, SessionLocal, engine
from .models import Comment, Favorite, Like, Pet, PetImage, Post, User
from .security import hash_password

IMG_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image"


def img(prompt: str, size: str = "portrait_4_3") -> str:
    return f"{IMG_API}?prompt={quote(prompt, safe='')}&image_size={size}"


PETS = [
    {
        "name": "奶盖",
        "species": "猫",
        "breed": "英国短毛猫",
        "gender": "公",
        "age": "1岁3个月",
        "city": "杭州",
        "tags": ["黏人精", "干饭王", "蓝胖子"],
        "likes": 328,
        "description": "奶盖是一只标准的蓝胖子，脸圆到可以当镜子照。最大的爱好是蹲在窗台晒太阳，以及在铲屎官吃饭时精准出现在大腿上。会握手、会叼球，情绪稳定，适合新手家庭。",
        "prompts": [
            "A chubby blue British Shorthair cat sitting on a sunny windowsill, soft fur, warm afternoon light, cozy home, high detail pet photography",
            "Blue British Shorthair cat with round face yawning, close-up portrait, soft studio light, adorable",
            "Blue gray cat lying on wooden floor playing with a small ball, natural light indoor photography",
        ],
    },
    {
        "name": "布丁",
        "species": "猫",
        "breed": "橘猫",
        "gender": "母",
        "age": "2岁",
        "city": "上海",
        "tags": ["吃货", "话痨", "橘里橘气"],
        "likes": 512,
        "description": "布丁是一只体重 6.2kg 的橘猫，自称是「行走的暖水袋」。每天准时在早上七点用爪子拍脸叫起床。会开门、会翻垃圾桶，智商过剩，请谨慎投喂。",
        "prompts": [
            "An orange tabby cat lying belly up on a beige sofa, fluffy, warm sunlight through window, cute pet photography",
            "Orange tabby cat looking at camera with big amber eyes, close-up, soft natural light",
            "Fat orange cat sitting in front of a food bowl meowing, cozy kitchen background, funny pet photo",
        ],
    },
    {
        "name": "雪球",
        "species": "猫",
        "breed": "布偶猫",
        "gender": "母",
        "age": "8个月",
        "city": "北京",
        "tags": ["仙女", "蓝眼睛", "高颜值"],
        "likes": 869,
        "description": "雪球有着一双蓝宝石眼睛和一身雪白长毛，走路像在飘。性格极其温柔，抱起来会当场「化掉」变成一滩猫。掉毛量大，请备好粘毛器。",
        "prompts": [
            "A beautiful ragdoll cat with blue eyes and white fluffy fur, elegant, soft window light, high-end pet portrait",
            "Ragdoll cat lying on a fluffy white blanket, blue eyes looking up, gentle mood, soft photography",
            "Fluffy white ragdoll kitten playing with yarn ball, bright clean room, adorable pet photography",
        ],
    },
    {
        "name": "豆豆",
        "species": "狗",
        "breed": "柯基",
        "gender": "公",
        "age": "3岁",
        "city": "成都",
        "tags": ["短腿", "电动小马达", "拆家"],
        "likes": 604,
        "description": "豆豆是一只腿短屁股圆的柯基，跑起来像一颗滚动的面包。会接飞盘、会装死，听见「遛弯」两个字就原地起跳三米高。掉毛，做好心理准备。",
        "prompts": [
            "A cute corgi with short legs running on green grass, big smile, sunny day, dynamic pet photography",
            "Corgi dog sitting with round fluffy butt visible, back view, park background, adorable",
            "Happy corgi catching a frisbee in the park, motion shot, golden hour light",
        ],
    },
    {
        "name": "阿柴",
        "species": "狗",
        "breed": "柴犬",
        "gender": "公",
        "age": "2岁6个月",
        "city": "深圳",
        "tags": ["表情包", "高冷", "戏精"],
        "likes": 733,
        "description": "阿柴面部肌肉异常发达，一天能产出 20 张表情包。表面上很高冷，其实非常黏主人。会自己开门进卧室，也会在被批评时翻白眼。",
        "prompts": [
            "A shiba inu dog with a funny expression, tilting head, clean minimal background, studio pet portrait",
            "Shiba inu smiling with squinted eyes, close-up, warm light, meme-worthy pet photo",
            "Shiba inu walking on a city street at dusk, cinematic, cool pet photography",
        ],
    },
    {
        "name": "可乐",
        "species": "狗",
        "breed": "金毛寻回犬",
        "gender": "母",
        "age": "4岁",
        "city": "广州",
        "tags": ["大暖男", "游泳健将", "治愈系"],
        "likes": 421,
        "description": "可乐是一只温柔到不像话的金毛，见到小朋友会主动趴下。最爱游泳和叼球，能连续接球 50 次不带喘。适合有孩子的家庭。",
        "prompts": [
            "A golden retriever swimming in a lake with a ball in mouth, splashing water, summer sunlight",
            "Golden retriever sitting peacefully in a meadow, soft backlight, warm portrait",
            "Golden retriever lying on the floor with head on paws, gentle eyes, cozy living room",
        ],
    },
    {
        "name": "芝麻",
        "species": "兔",
        "breed": "垂耳兔",
        "gender": "母",
        "age": "1岁",
        "city": "南京",
        "tags": ["软萌", "安静", "兔兔"],
        "likes": 257,
        "description": "芝麻是一只灰色垂耳兔，耳朵像两条小毛毯。喜欢吃提摩西草和苹果干，生气时会跺后腿，被摸头时会原地摊平。",
        "prompts": [
            "A gray lop-eared rabbit eating hay, soft fluffy ears, bright clean room, cute pet photography",
            "Lop eared rabbit lying flat relaxed on a soft mat, top view, adorable",
            "Grey bunny with long droopy ears close-up portrait, soft studio lighting",
        ],
    },
    {
        "name": "团子",
        "species": "仓鼠",
        "breed": "金丝熊",
        "gender": "公",
        "age": "6个月",
        "city": "武汉",
        "tags": ["掌心宠", "囤粮达人", "圆球"],
        "likes": 189,
        "description": "团子体长 12cm，腮帮子容量 3 倍。每天的工作是把食物从碗里搬到窝里，再搬回来。会在跑轮上跑到睡着。",
        "prompts": [
            "A cute golden hamster holding a sunflower seed with both paws, close-up macro, soft light",
            "Golden hamster stuffing cheeks with food, funny cute macro pet photography",
            "Hamster running on a colorful wheel inside a clean cage, bright photo",
        ],
    },
    {
        "name": "蓝莓",
        "species": "鸟",
        "breed": "虎皮鹦鹉",
        "gender": "母",
        "age": "1岁8个月",
        "city": "西安",
        "tags": ["会说话", "彩虹色", "机灵"],
        "likes": 342,
        "description": "蓝莓会叫自己的名字，还会学微波炉「叮」的声音。喜欢站在主人肩膀上跟着走来走去，讨厌被关笼子。",
        "prompts": [
            "A colorful budgerigar parakeet perched on a finger, bright feathers, soft light, pet photography",
            "Blue and green parakeet close-up portrait, detailed feather texture, clean background",
            "Budgie bird on a wooden perch in a bright room, cheerful mood",
        ],
    },
    {
        "name": "小饼干",
        "species": "猫",
        "breed": "美短起司",
        "gender": "公",
        "age": "5个月",
        "city": "杭州",
        "tags": ["幼猫", "活泼", "梅花印"],
        "likes": 445,
        "description": "小饼干是一只美短起司幼猫，脑门上有标志性的「M」形花纹。精力旺盛，一天要玩 6 小时逗猫棒，晚上会睡在枕头上。",
        "prompts": [
            "An american shorthair kitten with tabby M marking on forehead, playful, bright room, cute photography",
            "Tabby kitten pouncing on a feather toy, motion, soft indoor light",
            "Small tabby kitten sleeping on a white pillow, close-up, peaceful, soft light",
        ],
    },
]

POSTS = [
    {
        "title": "养猫三年，这 5 件东西真的别买",
        "content": "1. 全自动猫咪饮水机：我家两只猫都当摆设，最后还是用陶瓷碗。\n2. 猫衣服：穿上就原地石化，完全走不动。\n3. 猫窝：永远睡纸箱，猫窝只是装饰。\n4. 昂贵的猫抓板：不如 20 块瓦楞纸。\n5. 自动铲屎机：便宜款容易卡，贵的心疼钱。\n\n真正该花钱的地方：好的猫粮、定期体检、绝育、以及一个能晒到太阳的窗台。",
        "tags": ["养猫经验", "避坑指南", "新手必看"],
        "pet_name": "奶盖",
        "prompt": "A cozy sunlit living room with a fluffy cat sleeping on a windowsill, plants, warm aesthetic interior photography",
    },
    {
        "title": "柯基的屁股为什么这么圆？",
        "content": "柯基圆屁股的秘诀有三点：\n一是脂肪分布，臀部脂肪层天生较厚；\n二是被毛蓬松，视觉放大 1.5 倍；\n三是步态，走动时左右摇摆特别明显。\n\n所以「扭屁股」其实是髋关节结构决定的自然步态，不是故意卖萌——但效果确实很萌。",
        "tags": ["柯基", "冷知识", "萌宠科普"],
        "pet_name": "豆豆",
        "prompt": "A corgi walking away from camera showing round fluffy butt, park path, sunny day, funny pet photography",
    },
    {
        "title": "第一次带狗狗游泳，从害怕到上瘾只用 10 分钟",
        "content": "分享第一次带可乐游泳的完整过程：\n\n① 先在浅水区让她自己踩水，别硬抱下去；\n② 用零食建立「水=好事」的联想；\n③ 穿好救生衣，第一次不要超过 10 分钟；\n④ 上岸后立刻擦干耳朵，金毛很容易耳道感染；\n⑤ 结束时用最喜欢的小球收尾，形成好记忆。\n\n现在她看到泳池会自己往里冲，拉都拉不住。",
        "tags": ["金毛", "狗狗游泳", "遛狗日常"],
        "pet_name": "可乐",
        "prompt": "A happy golden retriever swimming in a clear lake, splashing water, summer golden sunlight, dynamic photography",
    },
    {
        "title": "布偶猫掉毛量实测：一天能梳出多少？",
        "content": "做了个 7 天实验：每天同一时间梳毛 10 分钟，收集后称重。\n\n平均值：每天 4.8 克，换毛季峰值 11.2 克。\n换算下来，一年大约产生 1.8 公斤浮毛。\n\n结论：长毛猫真的需要每天梳，不然你会怀疑家里是不是住了一只正在褪毛的羊。粘毛器按箱囤。",
        "tags": ["布偶猫", "养猫日常", "掉毛"],
        "pet_name": "雪球",
        "prompt": "A fluffy white ragdoll cat being brushed, loose fur visible, bright clean room, pet care photography",
    },
    {
        "title": "垂耳兔的「跺脚」到底在表达什么？",
        "content": "兔子跺后腿不是卖萌，而是情绪信号，主要有三种含义：\n\n· 生气或不满：比如你抢了它的苹果干\n· 警告：觉得周围有危险，向同伴示警\n· 引起注意：想让你看它一眼\n\n芝麻最常在我加班时跺脚，翻译过来大概是：「你该摸我了。」",
        "tags": ["垂耳兔", "兔兔行为", "萌宠科普"],
        "pet_name": "芝麻",
        "prompt": "A grey lop-eared rabbit on a soft mat looking at camera, fluffy, bright natural light, cute pet photography",
    },
    {
        "title": "在家给猫拍照的 6 个小心机",
        "content": "不用专业相机也能拍出小红书上那种猫片：\n\n1. 光源：只用窗边自然光，关掉顶灯；\n2. 角度：和猫眼睛同高度，蹲下来拍；\n3. 背景：纯色墙面或床单，别让杂物抢镜；\n4. 道具：逗猫棒举在镜头上方，眼神就来了；\n5. 连拍：糊 50 张换 1 张神图，正常；\n6. 后期：只提亮和降饱和，别磨皮。\n\n最重要的：别强迫，猫心情好才好看。",
        "tags": ["宠物摄影", "拍照技巧", "猫咪"],
        "pet_name": "PUDDING",
        "prompt": "A cat being photographed by a phone on a windowsill, natural light, aesthetic minimal home, behind the scenes pet photography",
    },
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.execute(delete(Comment))
        db.execute(delete(Favorite))
        db.execute(delete(Like))
        db.execute(delete(Post))
        db.execute(delete(PetImage))
        db.execute(delete(Pet))
        db.execute(delete(User))
        db.commit()

        admin = User(
            username="admin",
            password_hash=hash_password("admin123456"),
            nickname="星球管理员",
            avatar=img("A friendly cartoon planet logo with a cat and dog silhouette, flat vector style, red background", "square"),
            bio="负责维护宠物星球的内容与秩序",
            is_admin=True,
        )
        demo = User(
            username="demo",
            password_hash=hash_password("demo123456"),
            nickname="布丁的铲屎官",
            avatar=img("Cute cartoon avatar of a smiling girl with an orange cat, flat illustration, warm colors", "square"),
            bio="两只猫，一个家",
            is_admin=False,
        )
        db.add_all([admin, demo])
        db.flush()

        pet_id_by_name: dict[str, int] = {}
        for item in PETS:
            prompts = item.pop("prompts")
            pet = Pet(
                **item,
                cover_image=img(prompts[0]),
                views=120 + item["likes"] // 3,
                owner_id=admin.id,
            )
            db.add(pet)
            db.flush()
            pet_id_by_name[item["name"]] = pet.id
            for order, text in enumerate(prompts):
                db.add(
                    PetImage(
                        pet_id=pet.id,
                        url=img(text),
                        sort_order=order,
                    )
                )

        for item in POSTS:
            data = dict(item)
            pet_name = data.pop("pet_name")
            data["cover_image"] = img(data.pop("prompt"), "landscape_4_3")
            db.add(
                Post(
                    **data,
                    images=[data["cover_image"]],
                    likes=80 + len(data["content"]) % 300,
                    views=400 + len(data["content"]) * 3,
                    author_id=demo.id if pet_name != "PUDDING" else admin.id,
                    pet_id=pet_id_by_name.get(pet_name),
                )
            )

        db.commit()

        # 演示互动数据：收藏与评论
        pets = db.scalars(select(Pet).order_by(Pet.id)).all()
        posts = db.scalars(select(Post).order_by(Post.id)).all()

        for user_id, target_type, target_id in [
            (demo.id, "pet", pets[0].id),
            (admin.id, "pet", pets[0].id),
            (demo.id, "post", posts[0].id),
            (demo.id, "post", posts[1].id),
            (admin.id, "post", posts[0].id),
        ]:
            db.add(Favorite(user_id=user_id, target_type=target_type, target_id=target_id))
        db.flush()

        def add_comment(user_id, target_type, target_id, content, parent_id=None):
            row = Comment(
                user_id=user_id,
                target_type=target_type,
                target_id=target_id,
                content=content,
                parent_id=parent_id,
            )
            db.add(row)
            db.flush()
            return row

        first = add_comment(
            demo.id, "post", posts[0].id, "这条避坑指南太真实了，饮水机买回来就是摆设 😂"
        )
        add_comment(
            admin.id, "post", posts[0].id, "补充一句：猫抓板选瓦楞纸就够，省下的钱买好猫粮。", first.id
        )
        second = add_comment(
            admin.id, "post", posts[1].id, "柯基的圆屁股是基因决定的，属于科学卖萌。"
        )
        add_comment(
            demo.id, "post", posts[1].id, "我家那只走起来像果冻，根本停不下来 🍮", second.id
        )
        add_comment(demo.id, "pet", pets[0].id, "奶盖的圆脸也太治愈了，想 rua！")
        db.flush()

        for pet in pets:
            pet.favorites_count = (
                db.scalar(
                    select(func.count())
                    .select_from(Favorite)
                    .where(Favorite.target_type == "pet", Favorite.target_id == pet.id)
                )
                or 0
            )
            pet.comments_count = (
                db.scalar(
                    select(func.count())
                    .select_from(Comment)
                    .where(Comment.target_type == "pet", Comment.target_id == pet.id)
                )
                or 0
            )
        for post in posts:
            post.favorites_count = (
                db.scalar(
                    select(func.count())
                    .select_from(Favorite)
                    .where(Favorite.target_type == "post", Favorite.target_id == post.id)
                )
                or 0
            )
            post.comments_count = (
                db.scalar(
                    select(func.count())
                    .select_from(Comment)
                    .where(Comment.target_type == "post", Comment.target_id == post.id)
                )
                or 0
            )
        db.commit()

        print("演示数据初始化完成：")
        print("  管理员 admin / admin123456")
        print("  普通用户 demo / demo123456")
        print(f"  宠物 {len(PETS)} 只，帖子 {len(POSTS)} 篇，收藏与评论已同步")
    finally:
        db.close()


if __name__ == "__main__":
    main()
