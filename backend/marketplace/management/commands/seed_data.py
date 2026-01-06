import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.text import slugify
from marketplace.models import Category, Shop, Product, Order, OrderItem, Status

class Command(BaseCommand):
    help = 'Seeds the database with sample OTOP marketplace data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Users (Managers and Clients)
        self.stdout.write('Creating users...')
        password = '1234'
        
        managers = []
        for i in range(1, 4):
            username = f'manager{i}'
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(password)
                user.save()
            managers.append(user)

        clients = []
        for i in range(1, 6):
            username = f'client{i}'
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(password)
                user.save()
            clients.append(user)

        # 2. Create Categories
        self.stdout.write('Creating categories...')
        categories_data = [
            {'name': 'อาหารและเครื่องดื่ม', 'slug': 'food-drinks'},
            {'name': 'เครื่องแต่งกาย', 'slug': 'fashion-garments'},
            {'name': 'ของใช้และตกแต่ง', 'slug': 'home-decor'},
            {'name': 'สมุนไพรที่ไม่ใช่อาหาร', 'slug': 'herbal-products'},
        ]
        
        categories = []
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'], 
                defaults={'name': cat_data['name']}
            )
            categories.append(cat)

        # 3. Create Shops
        self.stdout.write('Creating shops...')
        shops_data = [
            {'name': 'ร้านแม่สมใจ ขนมหวาน', 'category': categories[0], 'owner': managers[0], 'desc': 'ขนมไทยโบราณ สูตรดั้งเดิม'},
            {'name': 'กลุ่มทอผ้าพื้นบ้านนาข่า', 'category': categories[1], 'owner': managers[1], 'desc': 'ผ้าไหมและผ้าฝ้ายทอมือคุณภาพเยี่ยม'},
            {'name': 'จักสานไม้ไผ่เมืองลับแล', 'category': categories[2], 'owner': managers[2], 'desc': 'งานฝีมือประณีตจากไม้ไผ่ธรรมชาติ'},
        ]

        shops = []
        for s_data in shops_data:
            shop, created = Shop.objects.get_or_create(
                name=s_data['name'],
                defaults={
                    'category': s_data['category'],
                    'owner': s_data['owner'],
                    'description': s_data['desc']
                }
            )
            shops.append(shop)

        # 4. Create Products
        self.stdout.write('Creating products...')
        products_data = [
            # Food
            {'name': 'ข้าวตูชาววัง', 'price': 85.00, 'shop': shops[0], 'category': categories[0]},
            {'name': 'น้ำเก๊กฮวยป่า', 'price': 35.00, 'shop': shops[0], 'category': categories[0]},
            {'name': 'ทองหยิบทองหยอด', 'price': 120.00, 'shop': shops[0], 'category': categories[0]},
            # Fashion
            {'name': 'ผ้าซิ่นตีนจก', 'price': 2500.00, 'shop': shops[1], 'category': categories[1]},
            {'name': 'เสื้อหม้อฮ่อม', 'price': 450.00, 'shop': shops[1], 'category': categories[1]},
            {'name': 'ผ้าพันคอใยสับปะรด', 'price': 890.00, 'shop': shops[1], 'category': categories[1]},
            # Decor
            {'name': 'ตะกร้าหวายสานมือ', 'price': 350.00, 'shop': shops[2], 'category': categories[2]},
            {'name': 'แจกันไม้ลงรักปิดทอง', 'price': 1200.00, 'shop': shops[2], 'category': categories[2]},
            {'name': 'โคมไฟกะลามะพร้าว', 'price': 590.00, 'shop': shops[2], 'category': categories[2]},
        ]

        for p_data in products_data:
            Product.objects.get_or_create(
                name=p_data['name'],
                shop=p_data['shop'],
                defaults={
                    'category': p_data['category'],
                    'price': p_data['price'],
                    'description': f'สินค้าท้องถิ่นคุณภาพ {p_data["name"]}',
                    'stock': 100
                }
            )

        # 5. Create Statuses
        self.stdout.write('Creating statuses...')
        status_names = ['PENDING', 'PAID', 'CANCELLED', 'SHIPPED', 'COMPLETED']
        statuses = {}
        for name in status_names:
            status, _ = Status.objects.get_or_create(name=name)
            statuses[name] = status

        # 6. Create Sample Orders
        self.stdout.write('Creating sample orders...')
        all_products = list(Product.objects.all())
        
        for client in clients[:2]: # Create orders for first 2 clients
            order = Order.objects.create(
                customer=client,
                status=statuses['PAID'],
                total_price=0
            )
            
            # Pick 2-3 random products from different shops
            sampled_products = random.sample(all_products, 2)
            total = 0
            for product in sampled_products:
                qty = random.randint(1, 3)
                subtotal = product.price * qty
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    shop=product.shop,
                    quantity=qty,
                    price=product.price
                )
                total += subtotal
            
            order.total_price = total
            order.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded OTOPS data!'))
